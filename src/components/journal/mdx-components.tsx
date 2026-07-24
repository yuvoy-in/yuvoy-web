import type { MDXComponents } from "mdx/types";

/** Brand-styled renderers for MDX journal content. */
export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      className="font-display text-forest mt-12 text-2xl sm:text-3xl"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="font-display text-forest mt-8 text-xl" {...props} />
  ),
  p: (props) => (
    <p className="text-forest/75 mt-5 leading-relaxed" {...props} />
  ),
  ul: (props) => (
    <ul className="text-forest/75 mt-5 list-disc space-y-2 pl-5" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-terra text-forest mt-8 border-l-2 pl-5 text-xl italic"
      {...props}
    />
  ),
  strong: (props) => (
    <strong className="text-forest font-semibold" {...props} />
  ),
  a: (props) => (
    <a className="text-terra underline underline-offset-4" {...props} />
  ),
};
