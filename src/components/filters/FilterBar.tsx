"use client";

import React from "react";
import { useMetadata } from "@/hooks/use-dashboard";

interface FilterBarProps {
    filters: Record<string, string | undefined>;
    onChange: (key: string, value: string | undefined) => void;
    showDateFilter?: boolean;
    showTeamMemberFilter?: boolean;
    showTicketTypeFilter?: boolean;
    showPriorityFilter?: boolean;
}

type FilterMode = "is" | "isNot" | "isAnyOf" | "isNoneOf";

const FILTER_MODES: { value: FilterMode; label: string }[] = [
    { value: "is", label: "is" },
    { value: "isNot", label: "is not" },
    { value: "isAnyOf", label: "is any of" },
    { value: "isNoneOf", label: "is none of" },
];

function FilterGroup({
    label,
    filterKeyPrefix,
    filters,
    onChange,
    options,
}: {
    label: string;
    filterKeyPrefix: string;
    filters: Record<string, string | undefined>;
    onChange: (key: string, value: string | undefined) => void;
    options: { id: string | number; label: string }[];
}) {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        if (!dropdownOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);
    // Determine active mode by checking which key has a value
    const modes = ["Is", "IsNot", "IsAnyOf", "IsNoneOf"] as const;
    const modeMap: Record<string, FilterMode> = { Is: "is", IsNot: "isNot", IsAnyOf: "isAnyOf", IsNoneOf: "isNoneOf" };
    const reverseMap: Record<FilterMode, string> = { is: "Is", isNot: "IsNot", isAnyOf: "IsAnyOf", isNoneOf: "IsNoneOf" };

    let activeMode: FilterMode = "is";
    for (const m of modes) {
        if (filters[`${filterKeyPrefix}${m}`]) {
            activeMode = modeMap[m];
            break;
        }
    }

    const activeKey = `${filterKeyPrefix}${reverseMap[activeMode]}`;
    const currentValue = filters[activeKey] || "";
    const isMulti = activeMode === "isAnyOf" || activeMode === "isNoneOf";
    const selectedValues = isMulti && currentValue ? currentValue.split(",") : [];

    const handleModeChange = (newMode: FilterMode) => {
        // We want to persist the current selected value(s) over to the new mode
        const newKey = `${filterKeyPrefix}${reverseMap[newMode]}`;

        // Clear all mode keys for this filter
        for (const m of modes) {
            if (m !== reverseMap[newMode]) {
                onChange(`${filterKeyPrefix}${m}`, undefined);
            }
        }

        // Apply the previous value to the new mode key, 
        // handle the transition between multi-select and single-select
        const isNewMulti = newMode === "isAnyOf" || newMode === "isNoneOf";

        if (currentValue) {
            if (!isMulti && isNewMulti) {
                // If single to multi, it's just the exact string
                onChange(newKey, currentValue);
            } else if (isMulti && !isNewMulti) {
                // Multi to single, take the first selected option if possible
                onChange(newKey, selectedValues[0] || undefined);
            } else {
                onChange(newKey, currentValue);
            }
        } else {
            onChange(newKey, undefined);
        }
    };

    const handleValueChange = (val: string) => {
        // Clear other mode keys first
        for (const m of modes) {
            if (m !== reverseMap[activeMode]) {
                onChange(`${filterKeyPrefix}${m}`, undefined);
            }
        }
        onChange(activeKey, val || undefined);
    };

    const handleMultiToggle = (optionId: string) => {
        let newValues: string[];
        if (selectedValues.includes(optionId)) {
            newValues = selectedValues.filter((v) => v !== optionId);
        } else {
            newValues = [...selectedValues, optionId];
        }
        // Clear other mode keys
        for (const m of modes) {
            if (m !== reverseMap[activeMode]) {
                onChange(`${filterKeyPrefix}${m}`, undefined);
            }
        }
        onChange(activeKey, newValues.length > 0 ? newValues.join(",") : undefined);
    };

    return (
        <div className="filter-group">
            <label className="filter-label">{label}</label>
            <div style={{ display: "flex", gap: 4 }}>
                <select
                    className="input"
                    style={{ width: 100, fontSize: 12, padding: "6px 8px" }}
                    value={activeMode}
                    onChange={(e) => handleModeChange(e.target.value as FilterMode)}
                >
                    {FILTER_MODES.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>

                {isMulti ? (
                    <div ref={dropdownRef} style={{ position: "relative" }}>
                        <div
                            className="input"
                            style={{
                                width: 180,
                                cursor: "pointer",
                                fontSize: 12,
                                minHeight: 36,
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 4,
                                padding: "4px 8px",
                            }}
                            onClick={() => setDropdownOpen((prev) => !prev)}
                        >
                            {selectedValues.length === 0 ? (
                                <span style={{ color: "var(--text-secondary)" }}>Select...</span>
                            ) : (
                                selectedValues.map((v) => {
                                    const opt = options.find((o) => String(o.id) === v);
                                    return (
                                        <span
                                            key={v}
                                            className="badge"
                                            style={{ fontSize: 11, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 2 }}
                                            onClick={(e) => { e.stopPropagation(); handleMultiToggle(v); }}
                                        >
                                            {opt?.label || v} ×
                                        </span>
                                    );
                                })
                            )}
                        </div>
                        {dropdownOpen && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 0,
                                    right: 0,
                                    background: "var(--surface-card)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: 8,
                                    zIndex: 50,
                                    maxHeight: 200,
                                    overflowY: "auto",
                                    marginTop: 4,
                                }}
                            >
                                {options.map((opt) => (
                                    <label
                                        key={opt.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "6px 10px",
                                            cursor: "pointer",
                                            fontSize: 12,
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedValues.includes(String(opt.id))}
                                            onChange={() => handleMultiToggle(String(opt.id))}
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <select
                        className="input"
                        style={{ width: 180 }}
                        value={currentValue}
                        onChange={(e) => handleValueChange(e.target.value)}
                    >
                        <option value="">All</option>
                        {options.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                )}
            </div>
        </div>
    );
}

export function FilterBar({
    filters,
    onChange,
    showDateFilter = true,
    showTeamMemberFilter = true,
    showTicketTypeFilter = true,
    showPriorityFilter = true,
}: FilterBarProps) {
    const { data: metadata } = useMetadata();

    const teamMemberOptions = metadata?.teamMembers.map((m) => ({
        id: m.id,
        label: m.username.replace("_", " "),
    })) || [];

    const ticketTypeOptions = metadata?.ticketTypes.map((t) => ({
        id: t.id,
        label: t.typeName,
    })) || [];

    const priorityOptions = [
        { id: "urgent", label: "Urgent" },
        { id: "high", label: "High" },
        { id: "medium", label: "Medium" },
        { id: "low", label: "Low" },
    ];

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <div className="filter-bar" style={{ marginBottom: 24 }}>
            {showDateFilter && (
                <>
                    <div className="filter-group">
                        <label className="filter-label">Exact Date</label>
                        <input
                            type="date"
                            className="input"
                            style={{ width: 140 }}
                            value={filters.dateExact || ""}
                            onChange={(e) => {
                                onChange("dateExact", e.target.value || undefined);
                                if (e.target.value) {
                                    onChange("dateFrom", undefined);
                                    onChange("dateTo", undefined);
                                }
                            }}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label" style={{ color: "var(--text-secondary)", fontSize: 11, fontStyle: "italic", alignSelf: "center", marginBottom: -4 }}>OR Range:</label>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">From Date</label>
                        <input
                            type="date"
                            className="input"
                            style={{ width: 140 }}
                            value={filters.dateFrom || ""}
                            onChange={(e) => {
                                onChange("dateFrom", e.target.value || undefined);
                                if (e.target.value) onChange("dateExact", undefined);
                            }}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">To Date</label>
                        <input
                            type="date"
                            className="input"
                            style={{ width: 140 }}
                            value={filters.dateTo || ""}
                            onChange={(e) => {
                                onChange("dateTo", e.target.value || undefined);
                                if (e.target.value) onChange("dateExact", undefined);
                            }}
                        />
                    </div>
                </>
            )}

            {showTeamMemberFilter && (
                <FilterGroup
                    label="Team Member"
                    filterKeyPrefix="teamMember"
                    filters={filters}
                    onChange={onChange}
                    options={teamMemberOptions}
                />
            )}

            {showTicketTypeFilter && (
                <FilterGroup
                    label="Ticket Type"
                    filterKeyPrefix="ticketType"
                    filters={filters}
                    onChange={onChange}
                    options={ticketTypeOptions}
                />
            )}

            {showPriorityFilter && (
                <FilterGroup
                    label="Priority"
                    filterKeyPrefix="priority"
                    filters={filters}
                    onChange={onChange}
                    options={priorityOptions}
                />
            )}

            {hasActiveFilters && (
                <div className="filter-group">
                    <label className="filter-label">&nbsp;</label>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            const keys = Object.keys(filters);
                            keys.forEach((k) => onChange(k, undefined));
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}
