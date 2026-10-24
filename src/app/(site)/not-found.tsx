import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container pb-24 pt-[clamp(40px,6vw,72px)]">
      <h1 className="text-[clamp(34px,5vw,60px)] leading-[1.05] tracking-tightest">No encontramos esa página</h1>
      <p className="mt-3 max-w-[560px] text-[19px] text-mut">Puede que el auto ya se haya vendido o que el enlace esté mal escrito.</p>
      <Button asChild className="mt-6">
        <Link href="/autos">Ver los autos</Link>
      </Button>
    </div>
  );
}
