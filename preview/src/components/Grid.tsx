/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { AllImagesData, getImageUrl, ImagePurpose } from "@insta-cyborg/util";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { DataState } from "../data/dataUtil";
import { Visibility } from "../util";

interface GridProps {
  mobile: boolean;
  visibility: Visibility;
  data: DataState<AllImagesData>;
  requestNewImage: () => Promise<void>;
}
const Grid: React.FC<GridProps> = ({
  mobile,
  visibility,
  data,
  requestNewImage,
}) => {
  if ("error" in data) {
    return (
      <>
        <h1>Error</h1>
        {data.message}
      </>
    );
  }

  if ("loading" in data) {
    return (
      <div
        css={css`
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div
      css={css`
        width: ${mobile ? 400 : 935}px;
        margin: 100px auto 50px;
      `}
    >
      <h1
        css={css`
          font-family: Lobster Two;
        `}
      >
        Insta-Cyborg
      </h1>
      <Stack
        flexDirection="row"
        spacing={2}
        marginBottom={2}
        alignItems="baseline"
      >
        <Button
          onClick={() => {
            requestNewImage();
          }}
        >
          Create new
        </Button>
        <Box sx={{ marginLeft: "auto !important" }}>
          <Typography>{data.data.posted.length}/123</Typography>
        </Box>
      </Stack>
      <div
        css={css`
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: ${mobile ? 3 : 28}px;
        `}
      >
        {visibility !== Visibility.HIDDEN &&
          data.data.available.map((imageId: string) => (
            <Link key={imageId} to={`/post/${imageId}`}>
              <div
                css={css`
                  ${visibility === Visibility.PREVIEW ? "opacity: 0.5;" : ""}
                  background-image: ${visibility === Visibility.PREVIEW
                    ? "linear-gradient(white, white), "
                    : ""}
                  url("${getImageUrl(
                    imageId,
                    ImagePurpose.POST_WITH_OVERLAY
                  )}");
                  background-blend-mode: saturation;
                  background-size: cover;
                  background-position: 50% 50%;
                  padding-bottom: 100%;
                `}
              />
            </Link>
          ))}
        {data.data.posted.map((imageId: string) => (
          <div
            key={imageId}
            css={css`
              background-image: url("${getImageUrl(
                imageId,
                ImagePurpose.POST_WITH_OVERLAY
              )}");
              background-size: cover;
              background-position: 50% 50%;
              padding-bottom: 100%;
            `}
          />
        ))}
      </div>
    </div>
  );
};

export default Grid;
