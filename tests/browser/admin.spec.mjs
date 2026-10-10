import { test, expect } from "@playwright/test";

const admin = { id: "00000000-0000-0000-0000-000000000001", full_name: "Test Administrator", role: "admin", chapter_id: null, created_at: "2026-01-01T00:00:00Z" };
const account = { id: "00000000-0000-0000-0000-000000000002", full_name: "Test Staff", role: "staff", chapter_id: "A", created_at: "2026-01-01T00:00:00Z" };
const current = new Date(Date.now() - 10000).toISOString();
const expiry = new Date(Date.now() + 30 * 86400000).toISOString();
const unit = { isbt_barcode: "00000000-0000-0000-0000-000000000003", current_chapter: "A", component_type: "PRBC", abo: "O", rh: "+", status: "Available", collection_date: current, expiration_date: expiry };
const event = { log_id: "log-test-1", user_id: account.id, action_type: "UPDATE", table_name: "blood_units", logged_at: current, old_data: unit, new_data: { ...unit, status: "Dispensed" } };

async function mockBackend(page, profile = admin, options = {}) {
    const calls = [];
    const data = {
        profiles: [profile, account, { ...account, id: "staff-b", chapter_id: "B", full_name: "Other Staff" }],
        blood_units: [unit, { ...unit, isbt_barcode: "unit-b", current_chapter: "B", expiration_date: null }],
        requisitions: [{ id: "request-1", target_chapter: "A", component_needed: "PRBC", units_req: 2, created_at: current }],
        serological_tests: [{ test_id: "test-1", unit_id: unit.isbt_barcode, final_result: "Passed", tested_at: current }],
        audit_logs: [event],
        transfers: [{ id: "transfer-test", requesting_chapter: "A", supplying_chapter: "B", component_needed: "PRBC", status: "Pending", requested_at: current }],
        requests: [], transfer_requests: [], appointments: [],
        chapters: [{ name: "Chapter A", category: "Permanent Chapters" }],
    };
    if (options.empty) for (const table of Object.keys(data)) if (table !== "profiles") data[table] = [];
    if (options.noOutcomes) data.audit_logs = [];
    if (options.prototype) {
        data.blood_units = [{ unit_id: "legacy-unit", component_type: "PRBC", status: "Available", collection_date: current }];
        data.audit_logs = [];
    }
    await page.routeWebSocket("**/realtime/v1/**", (socket) => socket.close());
    await page.route("**/auth/v1/**", async (route) => {
        const request = route.request();
        const user = { id: profile.id, email: "test-admin@example.invalid", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {}, created_at: current };
        const token = ["header", Buffer.from(JSON.stringify({ sub: profile.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url"), "signature"].join(".");
        const result = request.url().includes("/token") ? { access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, user } : user;
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(result) });
    });
    await page.route("**/rest/v1/**", async (route) => {
        const request = route.request(); const url = new URL(request.url());
        const table = url.pathname.split("/").pop(); const params = Object.fromEntries(url.searchParams);
        calls.push({ table, method: request.method(), params, rpc: url.pathname.includes("/rpc/") });
        if (request.method() !== "GET" || url.pathname.includes("/rpc/")) {
            await route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ message: "Unexpected database mutation or RPC" }) }); return;
        }
        if (options.denied?.includes(table)) {
            await route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ code: "42501", message: "permission denied for table" }) }); return;
        }
        if (options.prototype && ((table === "blood_units" && params.select?.includes("isbt_barcode")) || (table === "requisitions" && params.select?.includes("target_chapter")))) {
            await route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ code: "42703", message: `column ${table}.${table === "blood_units" ? "isbt_barcode" : "target_chapter"} does not exist` }) }); return;
        }
        if (!data[table]) { await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ message: "Unexpected table" }) }); return; }
        let rows = [...data[table]];
        const valueAt = (row, key) => key.includes("->>") ? row[key.split("->>")[0]]?.[key.split("->>")[1]] : row[key];
        for (const [key, filter] of url.searchParams) {
            if (["select", "order", "offset", "limit", "or"].includes(key)) continue;
            const dot = filter.indexOf("."); const op = filter.slice(0, dot); const value = filter.slice(dot + 1);
            rows = rows.filter((row) => {
                const actual = valueAt(row, key);
                if (op === "eq") return String(actual) === value;
                if (op === "in") return value.slice(1, -1).split(",").includes(String(actual));
                if (op === "ilike") return String(actual).toLowerCase().includes(value.replaceAll("%", "").toLowerCase());
                if (op === "gte") return Date.parse(actual) >= Date.parse(value);
                if (op === "lt") return Date.parse(actual) < Date.parse(value);
                if (op === "lte") return Date.parse(actual) <= Date.parse(value);
                return true;
            });
        }
        if (params.or) {
            const expressions = params.or.slice(1, -1).split(",");
            rows = rows.filter((row) => expressions.some((expression) => {
                const [key, value] = expression.split(".eq.");
                return String(valueAt(row, key)) === value?.replace(/^"|"$/g, "");
            }));
        }
        const total = rows.length; const offset = Number(params.offset || 0); const limit = Number(params.limit || 1000);
        rows = rows.slice(offset, offset + limit);
        const single = request.headers().accept?.includes("application/vnd.pgrst.object+json");
        await route.fulfill({ status: 200, contentType: "application/json", headers: { "content-range": `${offset}-${Math.max(offset, offset + rows.length - 1)}/${total}` }, body: JSON.stringify(single ? rows[0] || null : rows) });
    });
    return calls;
}
async function login(page) {
    await page.goto("/");
    await page.locator('input[type="email"]').fill("test-admin@example.invalid");
    await page.locator('input[type="password"]').fill("test-password");
    await page.getByRole("button", { name: "Sign In to Portal" }).click();
}
const readOnly = (calls) => expect(calls.every((call) => call.method === "GET" && !call.rpc)).toBe(true);

test("signed-out visitors are redirected and admin registration is unavailable", async ({ page }) => {
    await mockBackend(page);
    await page.goto("/admin/audit"); await expect(page.getByRole("heading", { name: "Account Sign In" })).toBeVisible();
    await page.getByRole("button", { name: "Register New Account" }).click();
    await expect(page.getByRole("button", { name: /^admin$/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^staff$/i })).toBeVisible();
});

test("admin reads existing tables, filters, exports, and has read-only accounts/settings", async ({ page }) => {
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    const calls = await mockBackend(page); await login(page);
    await expect(page.getByRole("heading", { name: "Transaction audit logs" })).toBeVisible();
    await page.getByRole("button", { name: "View", exact: true }).click();
    await expect(page.getByRole("region", { name: "Audit record details" })).toContainText("Not recorded");
    await expect(page.getByRole("region", { name: "Audit record details" })).toContainText("Dispensed");
    await page.getByRole("combobox", { name: "Action", exact: true }).selectOption("DELETE"); await expect(page.getByText("No records match this selection.")).toBeVisible();
    await page.getByRole("combobox", { name: "Action", exact: true }).selectOption("");
    await expect(page.getByRole("button", { name: "View", exact: true })).toBeVisible();
    await page.screenshot({ path: "test-results/admin-audit-desktop.png", fullPage: true });
    await page.getByRole("link", { name: "Reports", exact: true }).click(); await expect(page.getByRole("heading", { name: "Branch utilization reports" })).toBeVisible();
    await page.getByRole("combobox", { name: "Chapter", exact: true }).selectOption("A");
    await expect(page.getByRole("columnheader", { name: "Current stock" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Export PDF" })).toBeVisible();
    const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV" }).click()]); await csv.saveAs("test-results/report-preview.csv");
    const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export PDF" }).click()]); await pdf.saveAs("test-results/report-preview.pdf");
    await page.screenshot({ path: "test-results/admin-reports-desktop.png", fullPage: true });
    await page.getByRole("link", { name: "Supply monitoring" }).click(); await expect(page.getByRole("heading", { name: "Supply monitoring" })).toBeVisible();
    await page.getByRole("combobox", { name: "Chapter", exact: true }).selectOption("B");
    await expect(page.getByRole("cell", { name: "A", exact: true })).toHaveCount(0);
    await expect(page.getByRole("cell", { name: "B", exact: true }).first()).toBeVisible();
    await page.getByRole("link", { name: "Accounts", exact: true }).click(); await expect(page.getByRole("heading", { name: "Account directory" })).toBeVisible();
    await expect(page.getByText("Test Staff", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Edit access|Save access/ })).toHaveCount(0);
    await page.getByRole("link", { name: "Transfers", exact: true }).click(); await expect(page.getByRole("cell", { name: "Pending", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Portal settings", exact: true }).click(); await expect(page.getByRole("heading", { name: "Supply display guide" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Save/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Open account menu" }).click();
    await page.getByRole("button", { name: "Sign Out" }).click(); await expect(page.getByRole("heading", { name: "Account Sign In" })).toBeVisible();
    readOnly(calls); expect(errors).toEqual([]);
});

test("chapter admin filters queries and has responsive mobile navigation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const calls = await mockBackend(page, { ...admin, role: "chapter_admin", chapter_id: "A" }); await login(page);
    await expect(page.getByRole("heading", { name: "Transaction audit logs" })).toBeVisible();
    await expect(page.getByRole("button", { name: "View", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Portal settings", exact: true })).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "Chapter", exact: true })).toHaveCount(0);
    await page.screenshot({ path: "test-results/admin-audit-mobile.png", fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(calls.find((call) => call.table === "audit_logs").params.or).toContain('current_chapter.eq."A"');
    await page.getByRole("link", { name: "Accounts", exact: true }).click();
    await expect(page.getByText("Test Staff", { exact: true })).toBeVisible();
    await expect(page.getByText("Other Staff", { exact: true })).toHaveCount(0);
    await page.goto("/admin/settings"); await expect(page.getByRole("heading", { name: "National administrator access required" })).toBeVisible();
    readOnly(calls);
});

test("a non-admin cannot enter the admin portal", async ({ page }) => {
    await mockBackend(page, { ...admin, role: "donor" }); await login(page); await page.goto("/admin/audit");
    await expect(page.getByRole("heading", { name: "Administrator access required" })).toBeVisible();
});

test("existing permission denial is shown without asking for a migration", async ({ page }) => {
    const calls = await mockBackend(page, admin, { denied: ["audit_logs"] }); await login(page);
    await expect(page.getByText(/cannot read these records under the current database permissions/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await expect(page.getByText(/apply.*migration/)).toHaveCount(0);
    readOnly(calls);
});

test("empty audit data and unavailable outcome history are displayed honestly", async ({ page }) => {
    const calls = await mockBackend(page, admin, { empty: true }); await login(page);
    await expect(page.getByText("No records match this selection.")).toBeVisible();
    await page.getByRole("link", { name: "Reports", exact: true }).click();
    await expect(page.getByRole("cell", { name: "Unavailable", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Export CSV" })).toBeVisible(); readOnly(calls);
});

test("a report can export readable data when screening is denied", async ({ page }) => {
    const calls = await mockBackend(page, admin, { denied: ["serological_tests"], noOutcomes: true }); await login(page);
    await page.getByRole("link", { name: "Reports", exact: true }).click();
    await expect(page.getByText(/Screening unavailable:/)).toBeVisible();
    await expect(page.getByRole("cell", { name: "Unavailable", exact: true }).first()).toBeVisible();
    const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV" }).click()]);
    expect(csv.suggestedFilename()).toMatch(/prc-summary/); readOnly(calls);
});

test("the simpler existing inventory schema has a working read-only fallback", async ({ page }) => {
    const calls = await mockBackend(page, admin, { prototype: true }); await login(page);
    await page.getByRole("link", { name: "Supply monitoring" }).click();
    await expect(page.getByText(/usable supply breakdown is unavailable/)).toBeVisible();
    await expect(page.getByRole("cell", { name: "legacy-unit", exact: true })).toBeVisible();
    await page.screenshot({ path: "test-results/admin-supply-prototype.png", fullPage: true });
    await page.getByRole("link", { name: "Reports", exact: true }).click();
    await expect(page.getByText(/Current stock unavailable:/)).toBeVisible();
    await expect(page.getByText(/Requisitions unavailable:/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Export PDF" })).toBeVisible(); readOnly(calls);
});

test("main staff navigation reaches inventory, testing, transfers, and charts", async ({ page }) => {
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    const calls = await mockBackend(page, { ...admin, full_name: "Test Staff Member", role: "staff" }, { empty: true }); await login(page);
    await expect(page.getByRole("heading", { name: "PRC-BSIS Staff Command" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Branch Supply by Component" })).toBeVisible();
    await page.getByRole("link", { name: "Inflow / Outflow Ledger" }).click();
    await expect(page.getByRole("heading", { name: "Inventory Ledger" })).toBeVisible();
    await page.getByRole("button", { name: "+ Log New Unit" }).click();
    await expect(page.getByRole("heading", { name: "Log New Unit" })).toBeVisible();
    await page.getByRole("button", { name: "Close new unit form" }).click();
    await page.getByRole("link", { name: "Serological Testing" }).click();
    await expect(page.getByRole("heading", { name: "Pending (0)", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Transfer Coordination" }).click();
    await expect(page.getByRole("heading", { name: "Inter-Chapter Transfer Coordination (UC-09)" })).toBeVisible();
    await page.getByRole("link", { name: "Reports & Analytics" }).click();
    await expect(page.getByRole("heading", { name: "Cleared Inventory Distribution" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stock Levels" })).toBeVisible();
    await page.screenshot({ path: "test-results/merged-staff-reports.png", fullPage: true });
    expect(errors).toEqual([]); readOnly(calls);
});

test("main donor pages and guest booking remain available alongside admin", async ({ page }) => {
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    const calls = await mockBackend(page, { ...admin, full_name: "Test Donor", role: "donor", din: "DIN-TEST", blood_group: "O+" }, { empty: true }); await login(page);
    await expect(page.getByRole("heading", { name: "PRC Voluntary Donor Portal" })).toBeVisible();
    await page.getByRole("button", { name: "Book Donation Slot" }).click();
    await expect(page).toHaveURL(/\/donor\/book$/);
    await expect(page.getByRole("heading", { name: "Schedule Donation Slot" })).toBeVisible();
    await page.getByRole("button", { name: "Open account menu" }).click();
    await page.getByRole("button", { name: "Sign Out", exact: true }).click();
    await page.getByRole("button", { name: /Quick Guest Booking/ }).click();
    await expect(page.getByRole("button", { name: "Confirm Guest Appointment" })).toBeVisible();
    expect(errors).toEqual([]); readOnly(calls);
});

test("main physician form retains its signed-in profile", async ({ page }) => {
    const errors = []; page.on("pageerror", (error) => errors.push(error.message));
    const calls = await mockBackend(page, { ...admin, full_name: "Test Physician", role: "physician" }); await login(page);
    await expect(page).toHaveURL(/\/physician\/request$/);
    await expect(page.getByRole("heading", { name: "Submit Official Blood Requisition" })).toBeVisible();
    await expect(page.getByText("Test Physician", { exact: true }).last()).toBeVisible();
    expect(errors).toEqual([]); readOnly(calls);
});
