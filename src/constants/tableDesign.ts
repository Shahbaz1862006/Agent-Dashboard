/**
 * Single source of truth for ALL table styling across the dashboard.
 * Every table must use these values — no custom padding or spacing per table.
 */

/** Cell vertical padding — same for header and body */
export const TABLE_CELL_PY = "py-3";
/** Cell horizontal padding — same for all columns */
export const TABLE_CELL_PX = "px-4";
/** Combined cell padding class */
export const TABLE_CELL_PADDING = `${TABLE_CELL_PY} ${TABLE_CELL_PX}`;

/** Table container content padding — same on every table screen */
export const TABLE_CONTENT_PADDING = "pt-0 px-5 pb-0";

/** Row hover transition */
export const TABLE_ROW_HOVER = "hover:bg-muted/30";
export const TABLE_ROW_TRANSITION = "transition-[background-color] duration-150 ease-out";

/** Header: sticky, same font/color */
export const TABLE_HEADER_STICKY = "sticky top-0 z-10 bg-card border-b border-border";
export const TABLE_HEADER_TEXT = "text-xs font-medium text-muted-foreground";

/** Global column alignment: start (left) only. All columns share the same left edge per column. */
export const TABLE_CELL_ALIGN = "text-left";
