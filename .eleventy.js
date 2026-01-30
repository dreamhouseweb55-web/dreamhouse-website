module.exports = function (eleventyConfig) {
  // Copy static files to output
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/admin/config.yml": "admin/config.yml" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/data": "data" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });

  // Watch for changes in these files
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/ts/");
  eleventyConfig.addWatchTarget("src/images/");

  // Add formatPrice filter for Nunjucks
  eleventyConfig.addFilter("formatPrice", function (price) {
    if (!price || price === 0) return "السعر عند الطلب";
    return price.toLocaleString('ar-EG') + ' ج.م';
  });

  // Shuffle array filter
  eleventyConfig.addFilter("shuffle", function (array) {
    if (!Array.isArray(array)) return array;
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  });

  // Limit array filter
  eleventyConfig.addFilter("limit", function (array, limit) {
    if (!Array.isArray(array)) return array;
    return array.slice(0, limit);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
