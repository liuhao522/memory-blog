import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-slate-200 dark:border-slate-700 text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-800 font-semibold text-left text-sm">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm">
              {children}
            </td>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-slate-100 dark:bg-slate-800 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded text-sm font-normal"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm leading-relaxed my-6">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="my-8 border-slate-200 dark:border-slate-700" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-400 dark:border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 pl-4 py-1 my-4 rounded-r-lg">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
