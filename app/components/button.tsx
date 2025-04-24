import { cva } from "carbonyxation/css";

const button = cva({
  base: {
    padding: "2",
    minW: "8rem",
    borderRadius: "lg",
    fontSize: "sm",
    fontWeight: "medium",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
  },
  variants: {
    color: {
      primary: {
        backgroundColor: "primary.300",
        color: "white",
        _hover: {
          backgroundColor: "primary.400",
        },
      },
      secondary: {
        backgroundColor: "secondary.200",
        color: "black",
        _hover: {
          backgroundColor: "secondary.300",
        },
      },
      accent: {
        backgroundColor: "accent.200",
        color: "white",
        _hover: {
          backgroundColor: "accent.300",
        },
      },
    },
    variant: {
      outline: {
        padding: "calc(0.5rem - 2px)",
        backgroundColor: "transparent",
        border: "2px solid",

        "&.color-primary": {
          borderColor: "primary.300",
          color: "primary.300",
          _hover: {
            backgroundColor: "primary.100",
            color: "primary.400",
          },
        },
        "&.color-secondary": {
          borderColor: "secondary.200",
          color: "secondary.200",
          _hover: {
            backgroundColor: "secondary.100",
            color: "secondary.300",
          },
        },
        "&.color-accent": {
          borderColor: "accent.200",
          color: "accent.200",
          _hover: {
            backgroundColor: "accent.100",
            color: "accent.300",
          },
        },
      },
      solid: {
        "&.color-primary": {
          backgroundColor: "primary.300",
          color: "white",
          _hover: {
            backgroundColor: "primary.400",
          },
        },
        "&.color-secondary": {
          backgroundColor: "secondary.200",
          color: "black",
          _hover: {
            backgroundColor: "secondary.300",
          },
        },
        "&.color-accent": {
          backgroundColor: "accent.200",
          color: "white",
          _hover: {
            backgroundColor: "accent.300",
          },
        },
      },
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "outline",
      css: {
        borderColor: "primary.300",
        color: "primary.300",
        _hover: {
          backgroundColor: "primary.100",
          color: "primary.400",
        },
      },
    },
    {
      color: "secondary",
      variant: "outline",
      css: {
        borderColor: "secondary.200",
        color: "primary.400",
        _hover: {
          backgroundColor: "secondary.100",
          color: "primary.300",
        },
      },
    },
    {
      color: "accent",
      variant: "outline",
      css: {
        borderColor: "accent.200",
        color: "accent.300",
        _hover: {
          backgroundColor: "accent.100",
          color: "accent.300",
        },
      },
    },
  ],
});

export { button };
