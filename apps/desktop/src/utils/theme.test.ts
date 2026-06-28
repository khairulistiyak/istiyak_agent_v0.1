import { describe, it, expect } from "vitest";
import { curatedThemes, themes } from "./theme";

describe("Desktop Theme Configurations", () => {
  it("should have all curated themes defined", () => {
    expect(curatedThemes.length).toBeGreaterThan(0);
    curatedThemes.forEach(theme => {
      expect(theme).toHaveProperty("id");
      expect(theme).toHaveProperty("name");
      expect(theme).toHaveProperty("color");
    });
  });

  it("should map each curated theme id to its variable definitions", () => {
    curatedThemes.forEach(theme => {
      expect(themes).toHaveProperty(theme.id);
      const vars = themes[theme.id];
      expect(vars).toHaveProperty("--cyber-dark");
      expect(vars).toHaveProperty("--cyber-card");
      expect(vars).toHaveProperty("--cyber-primary");
    });
  });
});
