import Markdown from 'react-markdown'
// add a css file for markdown styles
import './markdown.css'

export const RenderMarkdown = ({markdown}) => {
    return (
        <div className="markdown-body">
            <Markdown>{markdown}</Markdown>
        </div>
    )
}
