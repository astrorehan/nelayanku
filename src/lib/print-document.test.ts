import { expect, it } from "vitest";
import { documentTable, escapeHtml } from "./print-document";

it("escapes text inserted into printable HTML", () => {
  expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
  );
  const table = documentTable(["Ikan"], [["<script>bad()</script>"]]);
  expect(table).not.toContain("<script>");
  expect(table).toContain("&lt;script&gt;");
});
