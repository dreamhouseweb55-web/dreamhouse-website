module.exports = function (eleventyConfig) {
  // Copy static files to output
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("admin/config.yml");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("data");
  eleventyConfig.addPassthroughCopy("assets");

  // Watch for changes in these files
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["html", "njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
