const PurgeCss = require('@fullhuman/postcss-purgecss');
const PurgeOptions = {

    // Specify the paths to all of the template files in your project 
    content: [
      './src/**/*.html',
      './src/**/*.vue',
      './src/**/*.jsx',
      // etc.
    ],
  
    // Include any special characters you're using in this regular expression
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
};

module.exports = {
    plugins: [
        require('tailwindcss'),
        PurgeCss(PurgeOptions),
    ],
}