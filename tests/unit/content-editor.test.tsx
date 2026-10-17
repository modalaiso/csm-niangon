import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContentEditor } from "@/components/admin/content-editor";

const { uploadMock } = vi.hoisted(() => ({
  uploadMock: vi.fn(),
}));

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: uploadMock,
        getPublicUrl: () => ({
          data: { publicUrl: "https://images.example.test/content/photo.png" },
        }),
      }),
    },
  }),
}));

function ControlledEditor({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <ContentEditor value={value} onChange={setValue} />;
}

describe("ContentEditor", () => {
  beforeEach(() => {
    uploadMock.mockReset();
    uploadMock.mockResolvedValue({ error: null });
  });

  it("formats selected text from the toolbar", () => {
    render(<ControlledEditor initial="Un mot important" />);
    const textarea = screen.getByRole("textbox", {
      name: "Contenu de la publication",
    }) as HTMLTextAreaElement;
    textarea.setSelectionRange(3, 16);
    fireEvent.select(textarea);
    fireEvent.click(screen.getByRole("button", { name: "Gras (Ctrl+B)" }));

    expect(textarea).toHaveValue("Un **mot important**");
  });

  it("uploads and inserts an image pasted into the editor", async () => {
    render(<ControlledEditor initial="Texte avant" />);
    const textarea = screen.getByRole("textbox", {
      name: "Contenu de la publication",
    });
    const image = new File(["image"], "photo.png", { type: "image/png" });

    fireEvent.paste(textarea, {
      clipboardData: {
        items: [
          {
            kind: "file",
            type: "image/png",
            getAsFile: () => image,
          },
        ],
      },
    });

    await waitFor(() => {
      expect(textarea).toHaveValue(
        "Texte avant\n\n![photo](https://images.example.test/content/photo.png)",
      );
    });
    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringMatching(/^content\/.+\.png$/),
      image,
      expect.objectContaining({ contentType: "image/png", upsert: false }),
    );
  });

  it("uploads and inserts an image dropped into the editor", async () => {
    render(<ControlledEditor />);
    const textarea = screen.getByRole("textbox", {
      name: "Contenu de la publication",
    });
    const image = new File(["image"], "action.jpg", { type: "image/jpeg" });

    fireEvent.drop(textarea, { dataTransfer: { files: [image] } });

    await waitFor(() => {
      expect(textarea).toHaveValue(
        "![action](https://images.example.test/content/photo.png)",
      );
    });
    expect(uploadMock).toHaveBeenCalledOnce();
  });
});
