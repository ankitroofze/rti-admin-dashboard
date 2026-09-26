import React from "react";

const HeadlineBlock = ({ data, onUpdate }) => {
  const [headline, setHeadline] = React.useState(data?.headline || "");
  const [subheadline, setSubheadline] = React.useState(data?.subheadline || "");

  React.useEffect(() => {
    if (data) {
      setHeadline(data.headline || "");
      setSubheadline(data.subheadline || "");
    }
  }, [data]);

  const handleChange = (field, value) => {
    if (field === "headline") setHeadline(value);
    if (field === "subheadline") setSubheadline(value);
    
    onUpdate({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="headline-block">
      <div className="mb-3">
        {/* <label className="form-label">Headline</label> */}
        {/* <input
          type="text"
          className="form-control"
          value={headline}
          onChange={(e) => handleChange("headline", e.target.value)}
          placeholder="Enter main headline"
        /> */}
      </div>
      <div className="mb-3">
        {/* <label className="form-label">Subheadline</label>
        <input
          type="text"
          className="form-control"
          value={subheadline}
          onChange={(e) => handleChange("subheadline", e.target.value)}
          placeholder="Enter subheadline (optional)"
        /> */}
      </div>
    </div>
  );
};

export default HeadlineBlock;