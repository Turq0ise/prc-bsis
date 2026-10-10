import { adminAccess, isNationalAdmin } from "./adminRoles.js";

export const PAGE_SIZE = 25;
export const COMPONENTS = ["Whole Blood", "PRBC", "Platelets", "FFP", "Cryoprecipitate", "Other"];
export const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
// Display indicators only. They do not configure stock rules in Supabase.
export const DISPLAY_THRESHOLDS = { critical_below: 5, low_below: 15, surplus_at: 50 };

export function componentName(value) {
    return ({ "whole blood": "Whole Blood", wb: "Whole Blood", "packed red blood cells": "PRBC", prbc: "PRBC", platelets: "Platelets", "platelet concentrates": "Platelets", "fresh frozen plasma": "FFP", ffp: "FFP", cryoprecipitate: "Cryoprecipitate" })[String(value || "").trim().toLowerCase()] || "Other";
}
export function bloodGroup(unit) {
    const abo = String(unit.abo || "").trim().toUpperCase();
    const raw = String(unit.rh || "").trim().toLowerCase();
    const rh = ({ positive: "+", negative: "-" })[raw] || raw;
    const group = `${abo}${rh}`;
    return BLOOD_GROUPS.includes(group) ? group : null;
}
export function resolveChapter(profile, requested = null) {
    if (!adminAccess(profile)) throw new Error("Administrator access required.");
    if (isNationalAdmin(profile.role)) return requested || null;
    if (requested && requested !== profile.chapter_id) throw new Error("Select your assigned chapter.");
    return profile.chapter_id;
}
export function dayBounds(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Choose a valid date.");
    const utc = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(utc.getTime()) || utc.toISOString().slice(0, 10) !== date) throw new Error("Choose a valid date.");
    const start = new Date(`${date}T00:00:00+08:00`);
    return { start: start.toISOString(), end: new Date(start.getTime() + 86400000).toISOString() };
}
export function availableUnit(unit, now = Date.now()) {
    const expiry = new Date(unit.expiration_date).getTime();
    return String(unit.status).toLowerCase() === "available" && Boolean(unit.expiration_date) && Number.isFinite(expiry) && expiry > now;
}
function pageRange(page = 0) {
    if (!Number.isInteger(page) || page < 0 || page > 100000) throw new Error("Invalid page.");
    return [page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1];
}
function errorText(error) {
    if (/42501|permission denied/i.test(`${error.code} ${error.message}`)) return "Your account cannot read these records under the current database permissions.";
    return error.message || "Unable to load records. Please try again.";
}
async function queryResult(query) {
    const response = await query;
    if (response.error) throw new Error(errorText(response.error));
    return response;
}
export async function readAll(makeQuery, maxRows = 20000) {
    const rows = [];
    const size = 500;
    for (let offset = 0; offset < maxRows;) {
        const response = await queryResult(makeQuery().range(offset, offset + size - 1));
        if (response.count > maxRows) throw new Error("Too many records for a browser summary. Select a chapter or a shorter period.");
        const batch = response.data || [];
        rows.push(...batch);
        const counted = response.count !== null && response.count !== undefined;
        if ((counted && rows.length >= response.count) || (!counted && batch.length < size)) return rows;
        if (!batch.length) throw new Error("The record count changed while loading. Please refresh the view.");
        offset += batch.length;
    }
    throw new Error("Too many records for a browser summary. Select a chapter or a shorter period.");
}
function scoped(query, column, chapter) { return chapter ? query.eq(column, chapter) : query; }
// PostgREST OR values need quoting; chapter identifiers may contain commas/quotes.
export function orValue(value) { return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`; }
function chapterAuditFilter(chapter) {
    const value = orValue(chapter);
    return ["old_data", "new_data"].flatMap((data) => ["current_chapter", "chapter_id", "target_chapter", "requesting_chapter", "supplying_chapter"].map((field) => `${data}->>${field}.eq.${value}`)).join(",");
}
export function logChapter(log) {
    const after = log.new_data || {};
    const before = log.old_data || {};
    return log.chapter_id || after.current_chapter || before.current_chapter || after.chapter_id || before.chapter_id || after.target_chapter || before.target_chapter || after.requesting_chapter || before.requesting_chapter || null;
}

async function loadChapters(client, profile) {
    const scope = resolveChapter(profile);
    if (scope) return [{ id: scope, name: scope }];
    const sources = await Promise.allSettled([
        readAll(() => client.from("profiles").select("id,chapter_id", { count: "exact" }).order("id")),
        readAll(() => client.from("blood_units").select("isbt_barcode,current_chapter", { count: "exact" }).order("isbt_barcode")),
        readAll(() => client.from("requisitions").select("id,target_chapter", { count: "exact" }).order("id")),
        readAll(() => client.from("transfers").select("id,requesting_chapter,supplying_chapter", { count: "exact" }).order("id")),
    ]);
    const chapters = new Set(profile.chapter_id ? [profile.chapter_id] : []);
    let readable = false;
    for (const source of sources) {
        if (source.status !== "fulfilled") continue;
        readable = true;
        for (const row of source.value) for (const key of ["chapter_id", "current_chapter", "target_chapter", "requesting_chapter", "supplying_chapter"]) if (row[key]) chapters.add(row[key]);
    }
    if (!readable) throw new Error("Unable to read the chapter identifiers from existing records.");
    return [...chapters].sort().map((id) => ({ id, name: id }));
}
async function loadAudit(client, params, chapter) {
    let query = client.from("audit_logs").select("*", { count: "exact" }).order("logged_at", { ascending: false, nullsFirst: false }).order("log_id", { ascending: false });
    if (chapter) query = query.or(chapterAuditFilter(chapter));
    if (params.p_action) query = query.eq("action_type", params.p_action);
    if (params.p_table) query = query.eq("table_name", params.p_table);
    // user_id is UUID in the existing schema; partial ilike is not valid on UUIDs.
    if (params.p_user) {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.p_user)) return { rows: [], total: 0 };
        query = query.eq("user_id", params.p_user);
    }
    if (params.p_from && params.p_to && params.p_to < params.p_from) throw new Error("The end date must be on or after the start date.");
    if (params.p_from) query = query.gte("logged_at", dayBounds(params.p_from).start);
    if (params.p_to) query = query.lt("logged_at", dayBounds(params.p_to).end);
    if (params.p_snapshot) query = query.lte("logged_at", params.p_snapshot);
    const response = await queryResult(query.range(...pageRange(params.p_page)));
    const rows = response.data || [];
    const users = [...new Set(rows.map((log) => log.user_id).filter(Boolean))];
    let names = new Map();
    if (users.length) {
        const actors = await client.from("profiles").select("id,full_name").in("id", users);
        if (!actors.error) names = new Map((actors.data || []).map((actor) => [actor.id, actor.full_name]));
    }
    return { rows: rows.map((log) => ({ ...log, actor_name: names.get(log.user_id) || null, chapter_id: logChapter(log), related_chapter_id: log.related_chapter_id || log.new_data?.supplying_chapter || log.old_data?.supplying_chapter || (log.old_data?.current_chapter !== log.new_data?.current_chapter ? log.old_data?.current_chapter : null) })), total: response.count ?? rows.length };
}
async function inventory(client, chapter) {
    try {
        const units = await readAll(() => scoped(client.from("blood_units").select("isbt_barcode,current_chapter,component_type,abo,rh,status,collection_date,expiration_date", { count: "exact" }), "current_chapter", chapter).order("isbt_barcode"));
        return { units, supplySupported: true };
    } catch (error) {
        if (!/column .* does not exist/i.test(error.message)) throw error;
        // The team's existing prototype uses unit_id and has no stock breakdown fields.
        if (chapter) throw new Error("Chapter inventory is unavailable because the existing table has no chapter assignment fields.", { cause: error });
        const units = await readAll(() => client.from("blood_units").select("unit_id,component_type,status,collection_date", { count: "exact" }).order("unit_id"));
        return { units: units.map((unit) => ({ ...unit, isbt_barcode: unit.unit_id })), supplySupported: false };
    }
}
export function supplySummary(units, chapters, now = Date.now()) {
    const visible = [...new Set([...chapters.map((chapter) => chapter.id), ...units.map((unit) => unit.current_chapter).filter(Boolean)])].sort();
    const counts = new Map();
    let unknownExpiry = 0;
    let invalidGroup = 0;
    for (const unit of units) {
        if (String(unit.status).toLowerCase() !== "available") continue;
        if (!unit.expiration_date || !Number.isFinite(new Date(unit.expiration_date).getTime())) { unknownExpiry++; continue; }
        if (!availableUnit(unit, now)) continue;
        const group = bloodGroup(unit);
        if (!group) { invalidGroup++; continue; }
        const key = JSON.stringify([unit.current_chapter, group, componentName(unit.component_type)]);
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    const rows = visible.flatMap((chapter_id) => COMPONENTS.flatMap((component) => BLOOD_GROUPS.map((blood_group) => {
        const units = counts.get(JSON.stringify([chapter_id, blood_group, component])) || 0;
        const tier = units < DISPLAY_THRESHOLDS.critical_below ? "Critical" : units < DISPLAY_THRESHOLDS.low_below ? "Low" : units >= DISPLAY_THRESHOLDS.surplus_at ? "Surplus" : "Sufficient";
        return { chapter_id, chapter_name: chapter_id, component, blood_group, units, tier };
    })));
    return { rows, thresholds: DISPLAY_THRESHOLDS, total_available: rows.reduce((total, row) => total + row.units, 0), chapter_count: visible.length, critical_count: rows.filter((row) => row.component !== "Other" && row.tier === "Critical").length, low_count: rows.filter((row) => row.component !== "Other" && row.tier === "Low").length, unknown_expiry: unknownExpiry, invalid_group: invalidGroup };
}

export function existingReport(units, requests, tests, logs, { start, end, chapter, now = Date.now(), warnings = [], currentStockSupported = true }) {
    const from = new Date(dayBounds(start).start).getTime();
    const through = new Date(dayBounds(end).end).getTime();
    const inPeriod = (value) => { if (!value) return false; const time = new Date(value).getTime(); return time >= from && time < through; };
    const datedOutcomes = new Map();
    for (const log of logs || []) {
        if (!inPeriod(log.logged_at) || log.table_name !== "blood_units") continue;
        const after = log.new_data || {};
        const before = log.old_data || {};
        const status = String(after.status || "").toLowerCase();
        if (!["dispensed", "discarded", "culled"].includes(status) || status === String(before.status || "").toLowerCase()) continue;
        const unit = after.isbt_barcode || before.isbt_barcode || after.unit_id || before.unit_id;
        if (!unit || (chapter && (after.current_chapter || before.current_chapter) !== chapter)) continue;
        const outcome = status === "dispensed" ? "dispensed" : "discarded";
        datedOutcomes.set(`${unit}:${outcome}`, { outcome, component: componentName(after.component_type || before.component_type) });
    }
    // An empty audit table does not prove complete zero activity for a month.
    const hasOutcomeEvidence = datedOutcomes.size > 0;
    const components = COMPONENTS.map((component) => {
        const matching = units?.filter((unit) => componentName(unit.component_type) === component);
        const matchingRequests = requests?.filter((request) => componentName(request.component_needed) === component && inPeriod(request.created_at));
        return { component, collections: matching ? matching.filter((unit) => inPeriod(unit.collection_date)).length : null,
            dispensed: hasOutcomeEvidence ? [...datedOutcomes.values()].filter((row) => row.component === component && row.outcome === "dispensed").length : null,
            discarded: hasOutcomeEvidence ? [...datedOutcomes.values()].filter((row) => row.component === component && row.outcome === "discarded").length : null,
            requisitions: matchingRequests?.length ?? null, units_requested: matchingRequests ? matchingRequests.reduce((sum, request) => sum + (Number(request.units_req) || 0), 0) : null,
            remaining: matching && currentStockSupported ? matching.filter((unit) => availableUnit(unit, now)).length : null };
    });
    const total = (key) => components.every((row) => row[key] === null) ? null : components.reduce((sum, row) => sum + (row[key] || 0), 0);
    let screening = null;
    if (tests) {
        const latest = new Map();
        const unitIds = new Set((units || []).map((unit) => unit.isbt_barcode));
        for (const screening of tests) {
            if (!screening.unit_id || !inPeriod(screening.tested_at) || (chapter && !unitIds.has(screening.unit_id))) continue;
            const previous = latest.get(screening.unit_id);
            if (!previous || new Date(screening.tested_at) > new Date(previous.tested_at)) latest.set(screening.unit_id, screening);
        }
        const rows = [...latest.values()];
        const passed = rows.filter((row) => String(row.final_result).toLowerCase() === "passed").length;
        screening = { tested: rows.length, passed, failed: rows.filter((row) => String(row.final_result).toLowerCase() === "failed").length, clearance_rate: rows.length ? Math.round(passed / rows.length * 1000) / 10 : null };
    }
    return { chapter, start, end, components, totals: { collections: total("collections"), dispensed: total("dispensed"), discarded: total("discarded"), requisitions: total("requisitions"), units_requested: total("units_requested"), remaining: total("remaining") }, screening, generated_at: new Date(now).toISOString(), warnings,
        notes: "Collections and screening are based on existing records and current chapter assignment. Dispenses/discards count only evidenced audit transitions; totals may be incomplete. Without dated transitions they are unavailable. Stock is current available, unexpired stock, not historical month-end stock. Deleted records and past chapter locations cannot be reconstructed." };
}
async function loadReport(client, params, chapter) {
    const start = params.p_start;
    const end = params.p_end;
    const from = dayBounds(start).start;
    const through = dayBounds(end).end;
    if (end < start) throw new Error("Choose a valid reporting period.");
    const results = await Promise.allSettled([
        inventory(client, chapter),
        readAll(() => scoped(client.from("requisitions").select("id,target_chapter,component_needed,units_req,created_at", { count: "exact" }), "target_chapter", chapter).gte("created_at", from).lt("created_at", through).order("id")).catch((error) => {
            if (/column .* does not exist/i.test(error.message)) throw new Error("The existing requisitions table lacks the fields needed for monthly request totals.");
            throw error;
        }),
        readAll(() => client.from("serological_tests").select("test_id,unit_id,final_result,tested_at", { count: "exact" }).gte("tested_at", from).lt("tested_at", through).order("test_id")),
        readAll(() => { let query = client.from("audit_logs").select("log_id,table_name,old_data,new_data,logged_at", { count: "exact" }).eq("table_name", "blood_units").gte("logged_at", from).lt("logged_at", through).order("log_id"); if (chapter) query = query.or(chapterAuditFilter(chapter)); return query; }),
    ]);
    const labels = ["Inventory", "Requisitions", "Screening", "Audit history"];
    const warnings = results.flatMap((result, index) => result.status === "rejected" ? [`${labels[index]} unavailable: ${result.reason.message}`] : []);
    if (results.every((result) => result.status === "rejected")) throw new Error("Unable to read the existing records for this report.");
    if (chapter && results[0].status === "rejected") { results[2] = { status: "rejected" }; warnings.push("Chapter screening totals require readable chapter inventory."); }
    const data = results.map((result) => result.status === "fulfilled" ? result.value : null);
    const currentStockSupported = data[0]?.supplySupported ?? false;
    if (data[0] && !currentStockSupported) warnings.push("Current stock unavailable: existing inventory has no chapter, blood-group, or expiry fields.");
    data[0] = data[0]?.units ?? null;
    return existingReport(...data, { start, end, chapter, warnings, currentStockSupported });
}

export async function loadAdminData(client, method, params, profile) {
    const chapter = resolveChapter(profile, params.p_chapter);
    switch (method) {
        case "chapters": return loadChapters(client, profile);
        case "audit": return loadAudit(client, params, chapter);
        case "supply": {
            const inventoryData = await inventory(client, chapter);
            const units = inventoryData.units;
            if (!inventoryData.supplySupported) return { rows: [], inventory_rows: units, breakdown_unavailable: true, recorded_units: units.length };
            let chapters;
            if (chapter) chapters = [{ id: chapter, name: chapter }];
            else { try { chapters = await loadChapters(client, profile); } catch { chapters = []; } }
            return supplySummary(units, chapters);
        }
        case "report": return loadReport(client, params, chapter);
        case "accounts": {
            let query = scoped(client.from("profiles").select("id,full_name,role,chapter_id,created_at", { count: "exact" }), "chapter_id", chapter);
            if (!isNationalAdmin(profile.role)) query = query.eq("role", "staff");
            if (params.p_search) query = query.ilike("full_name", `%${params.p_search.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`);
            const response = await queryResult(query.order("full_name", { nullsFirst: false }).order("id").range(...pageRange(params.p_page)));
            return { rows: response.data || [], total: response.count ?? response.data?.length ?? 0 };
        }
        case "transfers": {
            let query = client.from("transfers").select("id,requesting_chapter,supplying_chapter,component_needed,status,requested_at", { count: "exact" });
            if (chapter) query = query.or(`requesting_chapter.eq.${orValue(chapter)},supplying_chapter.eq.${orValue(chapter)}`);
            if (params.p_status) query = query.ilike("status", `%${params.p_status.replaceAll('%', '\\%').replaceAll('_', '\\_')}%`);
            const response = await queryResult(query.order("requested_at", { ascending: false, nullsFirst: false }).order("id").range(...pageRange(params.p_page)));
            return { rows: response.data || [], total: response.count ?? response.data?.length ?? 0 };
        }
        default: throw new Error("Unknown admin view.");
    }
}
