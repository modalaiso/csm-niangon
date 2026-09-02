import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderPostContent } from "@/lib/render-post-content";

describe("renderPostContent", () => {
  it("renders bold text as <strong>", () => {
    render(<>{renderPostContent("Ceci est **important**")}</>);
    const strong = screen.getByText("important");
    expect(strong.tagName).toBe("STRONG");
  });

  it("renders italic text as <em>", () => {
    render(<>{renderPostContent("Un mot *souligné* ici")}</>);
    const em = screen.getByText("souligné");
    expect(em.tagName).toBe("EM");
  });

  it("renders a heading for lines starting with ##", () => {
    render(<>{renderPostContent("## Titre de section")}</>);
    expect(
      screen.getByRole("heading", { level: 3, name: "Titre de section" }),
    ).toBeInTheDocument();
  });

  it("renders a blockquote for lines starting with >", () => {
    render(<>{renderPostContent("> Une note importante")}</>);
    expect(screen.getByText("Une note importante").closest("blockquote")).not.toBeNull();
  });

  it("renders a list for consecutive lines starting with -", () => {
    render(<>{renderPostContent("- Premier point\n- Deuxième point")}</>);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders markdown links with the correct href", () => {
    render(
      <>{renderPostContent("[CSM Niangon](https://csm-niangon.example.com)")}</>,
    );
    const link = screen.getByRole("link", { name: "CSM Niangon" });
    expect(link).toHaveAttribute("href", "https://csm-niangon.example.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders raw urls as clickable links and strips trailing punctuation", () => {
    render(<>{renderPostContent("Voir https://example.com/page.")}</>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com/page");
  });

  it("does not throw on empty content", () => {
    expect(() => render(<>{renderPostContent("")}</>)).not.toThrow();
  });
});
