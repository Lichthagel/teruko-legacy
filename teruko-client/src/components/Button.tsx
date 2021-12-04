import classNames from "classnames";
import { FunctionComponent } from "react";

const Button: FunctionComponent<{
    text: string;
    color?: string;
    className?: string;
    onClick?: () => void;
}> = ({ text, color, onClick, className }) =>
    <div
        className={classNames("inline-block bg-indigo-700 text-white leading-9 px-4 m-1 rounded select-none", { "cursor-pointer": onClick }, className)}
        style={{ backgroundColor: color }}
        onClick={() => onClick && onClick()}>
        {text}
    </div>;
export default Button;