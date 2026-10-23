import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <h1>No encontramos esa página</h1>
      <p>Puede que el auto ya se haya vendido o que el enlace esté mal escrito.</p>
      <p style={{ marginTop: 24 }}>
        <Link className="btn" href="/autos">Ver los autos</Link>
      </p>
    </div>
  );
}
