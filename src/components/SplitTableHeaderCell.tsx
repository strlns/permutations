import { createStyles } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { CSSProperties } from "react";

type SplitTableHeaderCellProps = {
  labelBottomLeft?: string;
  labelTopRight?: string;
} & React.HTMLAttributes<HTMLTableCellElement>;

const useStyles = createStyles((theme) => ({
  th: {
    textTransform: "uppercase",
    letterSpacing: "0.5ex",
    fontSize: "0.75em",
    fontWeight: "normal",
    height: "3.5rem",
    padding: "0 !important",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "8px",
      left: 0,
      right: 0,
      height: "1px",
      width: "calc(100% * var(--diag-ratio))",
      transform: "rotate(calc(45deg / var(--aspect-ratio)))",
      transformOrigin: "left center",
      background: theme.colors.gray,
      opacity: 0.25,
    },
  },
  text: {
    display: "flex",
    gridColumn: "1/1",
    gridRow: "1/1",
    height: "100%",
    width: "100%",
  },
  bottomLeft: {
    gridColumn: "1/1",
    gridRow: "1/1",
    alignItems: "flex-end",
    placeSelf: "end start",
    padding: "0.25em 0.25em 0.5em 0.125em",
  },
  topRight: {
    justifyContent: "flex-end",
    placeSelf: "start end",
    textAlign: "right",
    padding: "0.5em 0.125em 0.25em 3em",
  },
  /*
   * This amount of nesting is needed here to overlap the two boxes but still dynamically size the th.
   * Using display:flex directly on the th element would break layout.
   */
  wrapOuter: {
    display: "flex",
    alignItems: "stretch",
    height: "100%",
    minWidth: "4rem",
  },
  wrapInner: {
    display: "grid",
    width: "100%",
  },
}));

export const SplitTableHeaderCell = ({
  labelBottomLeft,
  labelTopRight,
  className,
  ...props
}: SplitTableHeaderCellProps) => {
  const { classes, cx } = useStyles();
  const outerClassName = cx(className, classes.th);
  const { ref: thRef, height, width } = useElementSize();
  let aspectRatio = width / height;
  let diagRatio = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)) / width;
  if (isNaN(aspectRatio) || typeof aspectRatio !== "number") {
    aspectRatio = 0;
  }
  if (isNaN(diagRatio) || typeof diagRatio !== "number") {
    diagRatio = 1;
  }
  return (
    <th
      className={outerClassName}
      {...props}
      ref={thRef}
      style={
        {
          "--aspect-ratio": aspectRatio,
          "--diag-ratio": diagRatio,
        } as CSSProperties
      }
    >
      <div className={classes.wrapOuter}>
        <div className={classes.wrapInner}>
          <span className={cx(classes.topRight, classes.text)}>
            {labelTopRight}
          </span>
          <span className={cx(classes.bottomLeft, classes.text)}>
            {labelBottomLeft}
          </span>
        </div>
      </div>
    </th>
  );
};
