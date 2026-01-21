import * as React from "react";
import { LoaderIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-5 animate-spin text-current", className)}
      {...props}
    />
  );
}
