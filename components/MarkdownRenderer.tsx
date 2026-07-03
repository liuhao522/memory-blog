import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-white prose-li:text-slate-600 dark:prose-li:text-slate-300">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-slate-200 dark:border-slate-800 px-3 py-2 bg-slate-50 dark:bg-slate-900 font-semibold text-left text-sm text-slate-700 dark:text-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
              {children}
            </td>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-300 px-1.5 py-0.5 rounded text-sm font-normal"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            const lang = className?.replace("language-", "");
            return (
              <div className="my-6">
                {lang && (
                  <div className="bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-4 py-1.5 rounded-t-xl border-b border-slate-300 dark:border-slate-700 font-mono">
                    {lang}
                  </div>
                )}
                <pre className={`!bg-[#0d1117] !text-[#c9d1d9] p-4 overflow-x-auto text-sm leading-relaxed ${lang ? "rounded-b-xl" : "rounded-xl"}`}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-primary-500 hover:underline"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="my-8 border-slate-200 dark:border-slate-800" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-500/5 pl-4 py-1 my-4 rounded-r-lg text-slate-600 dark:text-slate-300">
              {children}
            </blockquote>
          ),
          h2: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w一-鿿]+/g, "-")
              .replace(/(^-|-$)/g, "");
            return <h2 id={id}>{children}</h2>;
          },
          h3: ({ children }) => {
            const id = String(children)
              .toLowerCase()
              .replace(/[^\w一-鿿]+/g, "-")
              .replace(/(^-|-$)/g, "");
            return <h3 id={id}>{children}</h3>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
