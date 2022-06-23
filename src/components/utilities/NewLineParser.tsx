export function NewLineParser({text}) {
    return text.split("\n").map((line, index) => {
        return <span key={index}>{line}<br/></span>
    })
}