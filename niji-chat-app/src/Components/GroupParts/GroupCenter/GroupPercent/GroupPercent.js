import React from 'react';
import { Progress } from 'semantic-ui-react';

const groupPercent = ({ uploadState, percentUploaded }) =>
  uploadState === "uploading" && (
    <Progress
      percent={percentUploaded}
      progress
      indicating
      size="medium"
      inverted
    />
  );
export default groupPercent;