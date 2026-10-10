import test from "node:test";
import assert from "node:assert/strict";
import { adminAccess } from "../src/lib/adminRoles.js";
import { monthDates, csvCell, reportCsv } from "../src/lib/adminReports.js";
import { dayBounds, resolveChapter, readAll, supplySummary, existingReport, loadAdminData, orValue } from "../src/lib/adminData.js";

const admin = { id: "00000000-0000-0000-0000-000000000001", role: "admin" };
const chapterAdmin = { ...admin, role: "chapter_admin", chapter_id: "A" };
const now = Date.parse("2026-10-10T04:00:00Z");
const unit = { isbt_barcode: "unit-1", current_chapter: "A", component_type: "PRBC", abo: "o", rh: "positive", status: "Available", collection_date: "2026-10-01T00:00:00Z", expiration_date: "2026-11-01T00:00:00Z" };
const period = { start: "2026-10-01", end: "2026-10-31", now };

function mockClient(data, errors = {}) {
    const calls = [];
    return { calls, from(table) {
        const call = { table, steps: [] }; calls.push(call);
        let rows = data[table] || []; let range;
        const query = { then(resolve, reject) {
            const error = typeof errors[table] === "function" ? errors[table](call) : errors[table];
            const result = error ? { error } : { data: range ? rows.slice(range[0], range[1] + 1) : rows, count: rows.length, error: null };
            return Promise.resolve(result).then(resolve, reject);
        } };
        for (const method of ["select", "order", "eq", "or", "gte", "lt", "lte", "in", "ilike", "range"]) query[method] = (...args) => {
            call.steps.push([method, ...args]);
            if (method === "range") range = args;
            if (method === "eq") rows = rows.filter((row) => row[args[0]] === args[1]);
            if (method === "in") rows = rows.filter((row) => args[1].includes(row[args[0]]));
            return query;
        };
        return query;
    } };
}

test("existing roles work without requiring new profile columns", () => {
    assert.equal(adminAccess(admin), true);
    assert.equal(adminAccess({ ...admin, role: "donor" }), false);
    assert.equal(adminAccess({ ...chapterAdmin, chapter_id: null }), false);
    assert.equal(resolveChapter(chapterAdmin), "A");
    assert.throws(() => resolveChapter(chapterAdmin, "B"), /assigned chapter/);
    assert.equal(resolveChapter(admin, "B"), "B");
});

test("calendar boundaries include the full Philippine day and leap month", () => {
    assert.deepEqual(dayBounds("2026-10-01"), { start: "2026-09-30T16:00:00.000Z", end: "2026-10-01T16:00:00.000Z" });
    assert.deepEqual(monthDates("2024-02"), { start: "2024-02-01", end: "2024-02-29" });
    assert.throws(() => dayBounds("2026-02-30")); assert.throws(() => monthDates("2026-13"));
});

test("supply excludes expired, undated, and invalid blood groups and retains zero-stock chapters", () => {
    const result = supplySummary([unit, { ...unit, expiration_date: "2026-09-30" }, { ...unit, expiration_date: null }, { ...unit, abo: "unknown" }, { ...unit, status: "Dispensed" }], [{ id: "A" }, { id: "B" }], now);
    assert.equal(result.total_available, 1); assert.equal(result.unknown_expiry, 1); assert.equal(result.invalid_group, 1);
    assert.equal(result.rows.length, 96);
    assert.equal(result.rows.find((row) => row.chapter_id === "A" && row.component === "PRBC" && row.blood_group === "O+").units, 1);
    assert.equal(result.rows.find((row) => row.chapter_id === "B").tier, "Critical");
});

test("current terminal status cannot manufacture a monthly dispense date", () => {
    const report = existingReport([{ ...unit, status: "Dispensed" }], [], [], [], period);
    assert.equal(report.totals.collections, 1); assert.equal(report.totals.dispensed, null); assert.equal(report.totals.discarded, null);
    assert.equal(report.totals.remaining, 0);
    assert.match(reportCsv(report), /Unavailable/); assert.match(reportCsv(report), /Current available stock/);
});

test("reports use audit evidence, deduplicate outcomes, and keep current stock separate", () => {
    const log = { table_name: "blood_units", logged_at: "2026-10-02T00:00:00Z", old_data: unit, new_data: { ...unit, status: "Dispensed" } };
    const logs = [log, log, { ...log, new_data: { ...unit, status: "Dispensed", current_chapter: "B" } }, { ...log, logged_at: "2026-09-30T15:59:59Z", new_data: { ...unit, status: "Discarded" } }];
    const tests = [{ unit_id: unit.isbt_barcode, tested_at: "2026-10-01", final_result: "Failed" }, { unit_id: unit.isbt_barcode, tested_at: "2026-10-03", final_result: "Passed" }, { unit_id: "unrelated", tested_at: "2026-10-03", final_result: "Failed" }];
    const report = existingReport([unit, { ...unit, isbt_barcode: "later", collection_date: "2026-11-01" }], [{ component_needed: "PRBC", units_req: 3, created_at: "2026-10-02" }], tests, logs, { ...period, chapter: "A" });
    assert.equal(report.totals.collections, 1); assert.equal(report.totals.dispensed, 1); assert.equal(report.totals.discarded, 0);
    assert.equal(report.totals.remaining, 2); assert.equal(report.totals.units_requested, 3);
    assert.deepEqual(report.screening, { tested: 1, passed: 1, failed: 0, clearance_rate: 100 });
});

test("CSV escapes formulas and quotes without turning unavailable counts into zero", () => {
    assert.equal(csvCell('=SUM(A1)"'), '"\'=SUM(A1)"""');
    assert.equal(csvCell(" @cmd"), '"\' @cmd"');
    assert.equal(csvCell(0), '"0"');
});

test("batch reads respect the actual server batch size and exact count", async () => {
    const data = Array.from({ length: 7 }, (_, id) => ({ id })); const starts = [];
    const rows = await readAll(() => ({ range(start) { starts.push(start); return Promise.resolve({ data: data.slice(start, start + 2), count: data.length }); } }));
    assert.deepEqual(rows, data); assert.deepEqual(starts, [0, 2, 4, 6]);
    await assert.rejects(readAll(() => ({ range() { return Promise.resolve({ data: [], count: 20001 }); } })), /Too many records/);
    await assert.rejects(readAll(() => ({ range() { return Promise.resolve({ data: [], count: 1 }); } })), /record count changed/);
});

test("account reads paginate and scope staff using only existing columns", async () => {
    const client = mockClient({ profiles: [ { id: "1", role: "staff", chapter_id: "A" }, { id: "2", role: "donor", chapter_id: "A" }, { id: "3", role: "staff", chapter_id: "B" } ] });
    const result = await loadAdminData(client, "accounts", { p_page: 0 }, chapterAdmin);
    assert.equal(result.total, 1); assert.equal(result.rows[0].id, "1");
    assert.deepEqual(client.calls[0].steps.find(([type]) => type === "range"), ["range", 0, 24]);
    assert.equal(client.calls[0].steps[0][1], "id,full_name,role,chapter_id,created_at");
    await assert.rejects(loadAdminData(client, "accounts", { p_page: -1 }, admin), /Invalid page/);
});

test("audit filters are typed, scoped, and use Philippine dates", async () => {
    const client = mockClient({ audit_logs: [{ user_id: admin.id, new_data: { current_chapter: "A" } }], profiles: [admin] });
    const result = await loadAdminData(client, "audit", { p_user: admin.id, p_from: "2026-10-01", p_to: "2026-10-31", p_page: 1 }, chapterAdmin);
    assert.equal(result.rows.length, 0);
    const steps = client.calls[0].steps;
    assert.ok(steps.some(([m, v]) => m === "or" && v.includes('new_data->>current_chapter.eq."A"')));
    assert.ok(steps.some(([m, k, v]) => m === "gte" && k === "logged_at" && v === "2026-09-30T16:00:00.000Z"));
    assert.deepEqual(steps.find(([m]) => m === "range"), ["range", 25, 49]);
    assert.deepEqual(await loadAdminData(client, "audit", { p_user: "partial" }, admin), { rows: [], total: 0 });
    assert.equal(orValue('A,"B'), '"A,\\"B"');
});

test("permission errors are actionable and partial reports preserve readable sections", async () => {
    const denied = { code: "42501", message: "permission denied for table" };
    const client = mockClient({ blood_units: [unit], requisitions: [], audit_logs: [] }, { serological_tests: denied });
    const report = await loadAdminData(client, "report", { p_start: period.start, p_end: period.end }, admin);
    assert.equal(report.totals.collections, 1); assert.equal(report.screening, null);
    assert.match(report.warnings[0], /Screening unavailable.*current database permissions/);
    await assert.rejects(loadAdminData(mockClient({}, { audit_logs: denied }), "audit", {}, admin), /current database permissions/);
});

test("all admin data loaders use existing read-only tables without RPCs", async () => {
    const client = mockClient({ profiles: [{ ...admin, chapter_id: "A" }], blood_units: [], audit_logs: [], transfers: [], requisitions: [], serological_tests: [] });
    for (const method of ["chapters", "audit", "supply", "accounts", "transfers", "report"]) await loadAdminData(client, method, { p_start: period.start, p_end: period.end }, admin);
    assert.ok(client.calls.length > 6);
    const tables = new Set(["profiles", "blood_units", "audit_logs", "transfers", "requisitions", "serological_tests"]);
    assert.ok(client.calls.every((call) => tables.has(call.table) && call.steps[0][0] === "select"));
});

test("the existing unit_id prototype shows recorded inventory without inventing usable supply", async () => {
    const missing = { code: "42703", message: "column blood_units.isbt_barcode does not exist" };
    const client = mockClient({ blood_units: [{ unit_id: "old-unit", component_type: "PRBC", status: "Available", collection_date: "2026-10-02" }], serological_tests: [], audit_logs: [] }, {
        blood_units: (call) => call.steps[0][1].includes("isbt_barcode") ? missing : null,
        requisitions: { code: "42703", message: "column requisitions.target_chapter does not exist" },
    });
    const supply = await loadAdminData(client, "supply", {}, admin);
    assert.equal(supply.breakdown_unavailable, true); assert.equal(supply.recorded_units, 1);
    assert.equal(supply.inventory_rows[0].unit_id, "old-unit"); assert.equal(supply.total_available, undefined);
    const report = await loadAdminData(client, "report", { p_start: period.start, p_end: period.end }, admin);
    assert.equal(report.totals.collections, 1); assert.equal(report.totals.remaining, null); assert.equal(report.totals.requisitions, null);
    assert.equal(report.warnings.length, 2);
    await assert.rejects(loadAdminData(client, "supply", {}, chapterAdmin), /Chapter inventory is unavailable/);
});
