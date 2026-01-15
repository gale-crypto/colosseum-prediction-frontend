export default function Title({ text }: { text: string }) {
  return (
    <h1 
    className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 gold-text gelio-font arena-text"
    data-content={text}
    >
        {text}
    </h1>
  )
}