import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MultiImageUploadField } from "@/components/admin/multi-image-upload-field";

const { uploadMock } = vi.hoisted(() => ({
  uploadMock: vi.fn(),
}));

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: uploadMock,
        getPublicUrl: () => ({
          data: { publicUrl: "https://images.example.test/posts/photo.png" },
        }),
      }),
    },
  }),
}));

function ControlledUploadField() {
  const [images, setImages] = useState<string[]>([]);
  return <MultiImageUploadField value={images} onChange={setImages} />;
}

describe("MultiImageUploadField", () => {
  beforeEach(() => {
    uploadMock.mockReset();
    uploadMock.mockResolvedValue({ error: null });
  });

  it("uploads an image pasted into the upload area", async () => {
    render(<ControlledUploadField />);
    const region = screen.getByRole("region", {
      name: "Zone d’ajout des visuels",
    });
    const image = new File(["image"], "photo.png", { type: "image/png" });

    expect(
      fireEvent.paste(region, {
        clipboardData: {
          items: [
            {
              kind: "file",
              type: "image/png",
              getAsFile: () => image,
            },
          ],
        },
      }),
    ).toBe(false);

    expect(
      await screen.findByRole("img", { name: "Visuel 1" }),
    ).toHaveAttribute("src", "https://images.example.test/posts/photo.png");
    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringMatching(/\.png$/),
      image,
      expect.objectContaining({ upsert: false }),
    );
  });

  it("uploads an image dropped into the upload area", async () => {
    render(<ControlledUploadField />);
    const region = screen.getByRole("region", {
      name: "Zone d’ajout des visuels",
    });
    const image = new File(["image"], "photo.png", { type: "image/png" });

    expect(
      fireEvent.dragOver(region, { dataTransfer: { types: ["Files"] } }),
    ).toBe(false);
    fireEvent.drop(region, { dataTransfer: { files: [image] } });

    await waitFor(() => {
      expect(uploadMock).toHaveBeenCalledOnce();
    });
    expect(
      await screen.findByRole("img", { name: "Visuel 1" }),
    ).toBeInTheDocument();
  });
});
