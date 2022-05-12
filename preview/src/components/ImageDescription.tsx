/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import UserLine, { UserSays } from "./UserLine";

const instagramDescriptionToHTML = (description: string): string =>
  description
    .replace(/\n/gm, "<br/>")
    .replace(
      /#([^\s]+)/gu,
      "<a href='https://www.instagram.com/explore/tags/$1/' target='_blank' rel='noopener noreferrer'>#$1</a>"
    )
    .replace(
      /@([^\s]+)/gu,
      "<a href='https://www.instagram.com/$1/' target='_blank' rel='noopener noreferrer'>@$1</a>"
    );

export const ImageDescription = ({
  postCaption,
  mobile,
}: {
  postCaption: string;
  mobile?: boolean;
}) => {
  let captionText = postCaption;
  if (mobile) {
    captionText =
      captionText
        .split("\n")
        .slice(0, 2)
        .join("\n")
        .replace("\n\n", "")
        .substring(0, 110) + `<span class="more">... more</span>`;
  }
  const description = (
    <span
      dangerouslySetInnerHTML={{
        __html: instagramDescriptionToHTML(captionText),
      }}
      css={css`
        .more {
          color: gray;
        }
        a {
          text-decoration: none;
          color: #00376b !important;
        }
      `}
    />
  );
  if (mobile) {
    return <UserSays mobile>{description}</UserSays>;
  }
  return <UserLine multiLine>{description}</UserLine>;
};
