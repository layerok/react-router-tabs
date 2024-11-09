import { Link } from "react-router-dom";
import { homeRoute as basicHomeRoute } from "src/examples/basic/constants/routes.constants.ts";
import { homeRoute as clipOneHomeRoute } from "src/examples/clip-one/constants/routes.constants.ts";
import { css } from "@emotion/react";

export function HomeRoute() {
  return (
    <div css={containerStyles}>
      <div css={innerStyles}>
        <h1 css={titleStyles}>Examples:</h1>
        <ul>
          <li css={listItemStyles}>
            <Link to={basicHomeRoute}>Basic</Link>
          </li>
          <li css={listItemStyles}>
            <Link to={clipOneHomeRoute}>Clip one admin</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

const containerStyles = css`
  width: 100%;
  height: 100%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const listItemStyles = css`
  white-space: nowrap;
`;

const innerStyles = css`
  width: 100px;
`;

const titleStyles = css`
  font-size: 24px;
  margin: 0;
  font-weight: normal;
`;
