const theme = {
  token: {
    fontSize: 16,
    colorPrimary: '#52c41a',
    // Add more design tokens as needed
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 6,
  },
  components: {
    // Customize specific components
    Button: {
      colorPrimary: '#a95eff',
      colorPrimaryHover: '#8a4cd9',
      colorPrimaryActive: '#7a3ac6',
      primaryColor:"#8a2be2",
      borderColorDisabled: true,
      defaultHoverBg: "#a95eff", 
      paddingBlock:8,   },
    Input: {
      borderRadius: 4,
    },
  },
};

export default theme;
