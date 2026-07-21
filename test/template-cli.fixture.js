module.exports = {
  id: "pageTemplate",
  label: "Page Template",
  postType: "page",
  graphQLType: "Page",
  sections: [
    {
      component: function HeroSection() {},
      layout: "hero",
      props: {
        title: "header",
        content: { source: "content", type: "wysiwyg" },
      },
    },
    {
      component: function FaqSection() {},
      layout: "faq",
      props: {
        title: "header",
        items: { source: "items", type: "repeater" },
      },
    },
  ],
};
