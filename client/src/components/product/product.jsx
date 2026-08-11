import CommonButton from "../button/button";
import styles from "./product.module.css";

function ProductCard({
  primaryBtnShow = true,
  secondaryBtnShow = true,
  showDesc = true,
  data,
  primaryOnClick = () => ({}),
}) {
  return (
    <div className={`flex flex-col gap-4 ${styles.container}`}>
      <img
        src={data?.image || "https://placehold.co/600x400"}
        alt="image"
        className={`${styles.img}`}
      />
      <h1>{data?.title || "No title"}</h1>
      {showDesc && <p>{data?.description || "No Description found!"}</p>}
      {primaryBtnShow && (
        <CommonButton
          text={"Primary"}
          variant="primary"
          onClick={() => {
            primaryOnClick?.();
            console.log("Button Clicked!");
          }}
          icon={<img src="/assets/back.svg" className="svg" alt="back" />}
        />
      )}
      {secondaryBtnShow && (
        <CommonButton
          text={"Secondary"}
          variant="secondary"
          onClick={() => {
            console.log("Button Clicked!");
          }}
          icon={<img src="/assets/back.svg" className="svg" alt="back" />}
        />
      )}
    </div>
  );
}

export default ProductCard;
