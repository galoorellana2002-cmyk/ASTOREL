"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type Props = { children: React.ReactNode; message: string; className?: string } & VariantProps<typeof buttonVariants>;

/** Botón que pide confirmación en un diálogo antes de enviar su formulario. */
export function ConfirmButton({ children, message, className, variant = "danger", size = "sm" }: Props) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button ref={trigger} type="button" className={cn(buttonVariants({ variant, size }), className)}>
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-[91] w-[min(420px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-none border border-hair bg-card p-6 shadow-lift focus:outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <Dialog.Title className="text-lg tracking-tight">{message}</Dialog.Title>
          <div className="mt-6 flex justify-end gap-2.5">
            <Dialog.Close asChild>
              <Button variant="outline" size="sm" type="button">Cancelar</Button>
            </Dialog.Close>
            <Button
              variant="danger"
              size="sm"
              type="button"
              onClick={() => {
                setOpen(false);
                trigger.current?.closest("form")?.requestSubmit();
              }}
            >
              Confirmar
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
