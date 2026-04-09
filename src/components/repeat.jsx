import { Fragment } from "react";

export default function Repeat({
  value = [],
  view: Component = () => <li>x</li>,
  ...rest
}) {
  return (
    <Fragment>
      {value.map((it, index) => (
        <Component key={it?.id || it?.code || index} {...it} {...rest} />
      ))}
    </Fragment>
  );
}
