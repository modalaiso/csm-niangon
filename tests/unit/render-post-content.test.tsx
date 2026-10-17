import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderPostContent } from "@/lib/render-post-content";

describe("renderPostContent", () => {
  it("renders bold text as <strong>", () => {
    render(renderPostContent("Ceci est **important**"));
    const strong = screen.getByText("important");
    expect(strong.tagName).toBe("STRONG");
  });

  it("renders italic text as <em>", () => {
    render(renderPostContent("Un mot *souligné* ici"));
    const em = screen.getByText("souligné");
    expect(em.tagName).toBe("EM");
  });

  it("renders Markdown heading levels", () => {
    render(renderPostContent("## Titre de section"));
    expect(
      screen.getByRole("heading", { level: 2, name: "Titre de section" }),
    ).toBeInTheDocument();
  });

  it("renders a blockquote for lines starting with >", () => {
    render(renderPostContent("> Une note importante"));
    expect(
      screen.getByText("Une note importante").closest("blockquote"),
    ).not.toBeNull();
  });

  it("renders a list for consecutive lines starting with -", () => {
    render(renderPostContent("- Premier point\n- Deuxième point"));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders ordered lists and Markdown tables", () => {
    render(
      renderPostContent(
        "1. Première étape\n2. Deuxième étape\n\n| Nom | Valeur |\n| --- | --- |\n| Score | 3-1 |",
      ),
    );
    expect(screen.getByRole("list")).toHaveClass("list-decimal");
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("3-1")).toBeInTheDocument();
  });

  it("renders task lists and embedded images", () => {
    render(
      renderPostContent(
        "- [ ] À faire\n- [x] Terminé\n\n![Photo du match](https://example.com/match.png)",
      ),
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByRole("img", { name: "Photo du match" })).toHaveAttribute(
      "src",
      "https://example.com/match.png",
    );
  });

  it("does not render raw HTML as executable markup", () => {
    const { container } = render(
      renderPostContent("<script>alert('xss')</script>"),
    );
    expect(container.querySelector("script")).toBeNull();
  });

  it("renders markdown links with the correct href", () => {
    render(renderPostContent("[CSM Niangon](https://csm-niangon.example.com)"));
    const link = screen.getByRole("link", { name: "CSM Niangon" });
    expect(link).toHaveAttribute("href", "https://csm-niangon.example.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders raw urls as clickable links and strips trailing punctuation", () => {
    render(renderPostContent("Voir https://example.com/page."));
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com/page");
  });

  it("does not throw on empty content", () => {
    expect(() => render(renderPostContent(""))).not.toThrow();
  });
});
