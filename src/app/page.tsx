import Book from "@/components/Book";

export default function Home() {
  return (
    <>
      <Book />
      <div className="grain" />
      <noscript>
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <h1>DawnDevs — website studio</h1>
          <p>
            This experience needs JavaScript. Email us at{" "}
            <a href="mailto:akshay.dx4@gmail.com">akshay.dx4@gmail.com</a>.
          </p>
        </div>
      </noscript>
    </>
  );
}
