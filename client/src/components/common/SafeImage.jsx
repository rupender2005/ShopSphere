import { useEffect, useState } from "react";
import Box from "@mui/material/Box";

const fallbackImage = "/product-fallback.svg";

const SafeImage = ({ src, alt = "", onError, ...props }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <Box
      {...props}
      component="img"
      src={!src || failed ? fallbackImage : src}
      alt={alt}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
};

export default SafeImage;
