import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

describe("ConfirmDialog Component", () => {
  it("does not render when isOpen is false", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={false}
        title="¿Confirmar acción?"
        description="Esta acción es irreversible."
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    expect(screen.queryByText("¿Confirmar acción?")).toBeNull();
  });

  it("renders title, description and calls onConfirm when confirmed", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="¿Confirmar cambio de rol?"
        description="Se actualizarán los permisos del usuario."
        confirmLabel="Sí, cambiar"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    expect(screen.getByText("¿Confirmar cambio de rol?")).toBeDefined();
    expect(screen.getByText("Se actualizarán los permisos del usuario.")).toBeDefined();

    const confirmBtn = screen.getByText("Sí, cambiar");
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel button is clicked", () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen={true}
        title="¿Eliminar elemento?"
        description="Se eliminará permanentemente."
        cancelLabel="No, cancelar"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    const cancelBtn = screen.getByText("No, cancelar");
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
