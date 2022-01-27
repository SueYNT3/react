import React from 'react';
import { Progress } from 'semantic-ui-react';

const PrivatePercent = ({ uploadState, percentUploaded }) =>
  uploadState === "uploading" && (
    <Progress
      percent={percentUploaded}
      progress
      indicating
      size="medium"
      inverted
    />
  );
export default PrivatePercent;