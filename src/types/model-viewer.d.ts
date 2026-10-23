import type * as React from "react";

type ModelViewerAttrs = React.HTMLAttributes<HTMLElement> & {
  src?: string;
  alt?: string;
  ar?: string;
  "ar-modes"?: string;
  "camera-controls"?: string;
  "touch-action"?: string;
  "shadow-intensity"?: string;
  exposure?: string;
  "interaction-prompt"?: string;
  "camera-target"?: string;
  loading?: string;
  ref?: React.Ref<ModelViewerElement>;
};

export interface ModelViewerElement extends HTMLElement {
  getDimensions(): { x: number; y: number; z: number };
  getBoundingBoxCenter(): { x: number; y: number; z: number };
  canActivateAR: boolean;
  activateAR(): Promise<void>;
  cameraTarget: string;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttrs;
    }
  }
}
