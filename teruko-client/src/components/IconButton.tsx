import clsx from "clsx";
import { FunctionComponent } from "preact";

const IconButton: FunctionComponent<JSX.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div className={clsx("h-10 w-10 m-1 hover:bg-black/20 rounded transition", { "cursor-pointer": props.onClick }, props.className)} {...props}>
    {children}
  </div>
);

export default IconButton;
