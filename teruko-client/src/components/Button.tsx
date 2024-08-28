import clsx from "clsx";
import { FunctionComponent } from "preact";

const Button: FunctionComponent<{
  text: string;
  color?: string;
  className?: string;
  onClick?: () => void;
}> = ({
  text, color, onClick, className,
}) => (
  <div
    className={clsx("inline-block bg-indigo-700 text-white leading-9 px-4 m-1 rounded select-none", { "cursor-pointer": onClick }, className)}
    onClick={() => onClick && onClick()}
    style={{ backgroundColor: color }}
  >
    {text}
  </div>
);
export default Button;
