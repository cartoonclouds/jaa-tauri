import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

const flow = {
  bg: "#050814",
  bgSoft: "#070d1f",
  surface: "#0b1328",
  surface2: "#111a35",
  border: "#26345f",
  text: "#f8fafc",
  muted: "#a4acc6",
  subtle: "#6f7897",
  blue: "#0978ff",
  cyan: "#18c8ff",
  violet: "#7c3cff",
  lilac: "#b68cff",
  pink: "#d2a2ff",
  success: "#8b7dff",
  warning: "#f5b95f",
  danger: "#ff6b8a",
} as const;

const radius = {
  xs: "0.5rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
} as const;

const glow = {
  card: "0 24px 80px rgb(0 0 0 / 0.45)",
  violet: "0 0 48px rgb(124 60 255 / 0.35)",
  blue: "0 0 36px rgb(9 120 255 / 0.35)",
} as const;

const ApplyFlowPreset = definePreset(Aura, {
  primitive: {
    flow,
    blue: {
      50: "#eff8ff",
      100: "#dff1ff",
      200: "#b8e5ff",
      300: "#7bd3ff",
      400: flow.cyan,
      500: flow.blue,
      600: "#075fe0",
      700: "#084db4",
      800: "#0b418f",
      900: "#103a77",
      950: "#071a38",
    },
    violet: {
      50: "#f5f0ff",
      100: "#ede3ff",
      200: "#dccbff",
      300: flow.lilac,
      400: "#9b6bff",
      500: flow.violet,
      600: "#6728f0",
      700: "#5520c8",
      800: "#461da1",
      900: "#3c1c82",
      950: "#1f0e49",
    },
  },

  semantic: {
    borderRadius: {
      none: "0",
      xs: radius.xs,
      sm: radius.sm,
      md: radius.md,
      lg: radius.lg,
      xl: radius.xl,
    },

    primary: {
      50: "{blue.50}",
      100: "{blue.100}",
      200: "{blue.200}",
      300: "{blue.300}",
      400: "{blue.400}",
      500: "{blue.500}",
      600: "{blue.600}",
      700: "{blue.700}",
      800: "{blue.800}",
      900: "{blue.900}",
      950: "{blue.950}",
    },

    focusRing: {
      width: "2px",
      style: "solid",
      color: flow.lilac,
      offset: "2px",
      shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
    },

    formField: {
      paddingX: "1rem",
      paddingY: "0.625rem",
      borderRadius: radius.md,
      transitionDuration: "160ms",
    },

    colorScheme: {
      dark: {
        primary: {
          color: flow.blue,
          contrastColor: "#ffffff",
          hoverColor: flow.cyan,
          activeColor: flow.violet,
        },
        highlight: {
          background: "rgb(124 60 255 / 0.18)",
          focusBackground: "rgb(124 60 255 / 0.26)",
          color: "#ffffff",
          focusColor: "#ffffff",
        },
        surface: {
          0: "#ffffff",
          50: "#f8fafc",
          100: "#e9edf7",
          200: "#cdd5ea",
          300: "#aab6d6",
          400: flow.muted,
          500: flow.subtle,
          600: "#4f5a78",
          700: flow.border,
          800: flow.surface2,
          900: flow.surface,
          950: flow.bg,
        },
        text: {
          color: flow.text,
          hoverColor: "#ffffff",
          mutedColor: flow.muted,
          hoverMutedColor: "#d9def0",
        },
        content: {
          background: "rgb(11 19 40 / 0.92)",
          hoverBackground: "rgb(17 26 53 / 0.96)",
          borderColor: "rgb(38 52 95 / 0.72)",
          color: flow.text,
          hoverColor: "#ffffff",
        },
        overlay: {
          modal: {
            background: "rgb(11 19 40 / 0.96)",
            borderColor: "rgb(38 52 95 / 0.8)",
            color: flow.text,
          },
          popover: {
            background: "rgb(11 19 40 / 0.96)",
            borderColor: "rgb(38 52 95 / 0.8)",
            color: flow.text,
          },
          select: {
            background: "rgb(11 19 40 / 0.96)",
            borderColor: "rgb(38 52 95 / 0.8)",
            color: flow.text,
          },
        },
        mask: {
          background: "rgb(0 0 0 / 0.65)",
          color: flow.text,
        },
        formField: {
          background: flow.surface,
          disabledBackground: "rgb(17 26 53 / 0.7)",
          filledBackground: flow.surface2,
          filledHoverBackground: "#151f3f",
          filledFocusBackground: flow.surface,
          borderColor: flow.border,
          hoverBorderColor: flow.lilac,
          focusBorderColor: flow.violet,
          invalidBorderColor: flow.danger,
          color: flow.text,
          disabledColor: flow.subtle,
          placeholderColor: flow.subtle,
          invalidPlaceholderColor: "#ffa3b6",
          floatLabelColor: flow.muted,
          floatLabelFocusColor: flow.lilac,
          floatLabelActiveColor: flow.lilac,
          iconColor: flow.muted,
          shadow: "none",
        },
      },
    },
  },

  components: {
    button: {
      root: {
        borderRadius: radius.md,
        gap: "0.5rem",
        paddingX: "1rem",
        paddingY: "0.625rem",
        raisedShadow: glow.violet,
        label: {
          fontWeight: "600",
        },
        focusRing: {
          width: "2px",
          style: "solid",
          offset: "2px",
        },
        sm: {
          fontSize: "0.875rem",
          paddingX: "0.875rem",
          paddingY: "0.5rem",
        },
        lg: {
          fontSize: "1rem",
          paddingX: "1.125rem",
          paddingY: "0.75rem",
        },
        primary: {
          background: `linear-gradient(135deg, ${flow.blue}, ${flow.violet} 60%, ${flow.lilac})`,
          hoverBackground: `linear-gradient(135deg, ${flow.cyan}, ${flow.violet} 60%, ${flow.lilac})`,
          activeBackground: `linear-gradient(135deg, ${flow.blue}, ${flow.violet})`,
          color: "#ffffff",
          hoverColor: "#ffffff",
          activeColor: "#ffffff",
        },
        secondary: {
          background: flow.surface2,
          hoverBackground: flow.surface,
          activeBackground: flow.surface,
          borderColor: flow.border,
          hoverBorderColor: flow.lilac,
          color: flow.text,
          hoverColor: flow.text,
          activeColor: flow.text,
        },
        success: {
          background: `linear-gradient(135deg, ${flow.cyan}, ${flow.violet})`,
          hoverBackground: `linear-gradient(135deg, ${flow.cyan}, ${flow.lilac})`,
          activeBackground: `linear-gradient(135deg, ${flow.cyan}, ${flow.violet})`,
          color: "#ffffff",
          hoverColor: "#ffffff",
          activeColor: "#ffffff",
        },
        warn: {
          background: flow.warning,
          hoverBackground: "#ffc569",
          activeBackground: flow.warning,
          color: flow.bg,
          hoverColor: flow.bg,
          activeColor: flow.bg,
        },
        danger: {
          background: `linear-gradient(135deg, ${flow.danger}, #ff4081)`,
          hoverBackground: `linear-gradient(135deg, #ff7a96, #ff4081)`,
          activeBackground: `linear-gradient(135deg, ${flow.danger}, #ff4081)`,
          color: "#ffffff",
          hoverColor: "#ffffff",
          activeColor: "#ffffff",
        },
      },
      outlined: {
        primary: {
          hoverBackground: "rgb(9 120 255 / 0.1)",
          activeBackground: "rgb(124 60 255 / 0.16)",
          borderColor: flow.blue,
          color: flow.blue,
        },
        secondary: {
          hoverBackground: "rgb(124 60 255 / 0.08)",
          activeBackground: "rgb(124 60 255 / 0.14)",
          borderColor: flow.border,
          color: flow.text,
        },
        success: {
          hoverBackground: "rgb(24 200 255 / 0.08)",
          activeBackground: "rgb(124 60 255 / 0.14)",
          borderColor: flow.cyan,
          color: flow.cyan,
        },
        warn: {
          hoverBackground: "rgb(245 185 95 / 0.08)",
          activeBackground: "rgb(245 185 95 / 0.14)",
          borderColor: flow.warning,
          color: flow.warning,
        },
        danger: {
          hoverBackground: "rgb(255 107 138 / 0.08)",
          activeBackground: "rgb(255 107 138 / 0.14)",
          borderColor: flow.danger,
          color: flow.danger,
        },
      },
      text: {
        primary: {
          hoverBackground: "rgb(9 120 255 / 0.08)",
          activeBackground: "rgb(9 120 255 / 0.14)",
          color: flow.blue,
        },
        secondary: {
          hoverBackground: "rgb(124 60 255 / 0.08)",
          activeBackground: "rgb(124 60 255 / 0.14)",
          color: flow.text,
        },
        danger: {
          hoverBackground: "rgb(255 107 138 / 0.08)",
          activeBackground: "rgb(255 107 138 / 0.14)",
          color: flow.danger,
        },
      },
      link: {
        color: flow.lilac,
        hoverColor: "#ffffff",
        activeColor: flow.cyan,
      },
    },

    card: {
      root: {
        background: "rgb(11 19 40 / 0.9)",
        borderRadius: radius.lg,
        color: flow.text,
        shadow: glow.card,
      },
      body: {
        padding: "0.75rem",
        gap: "0.75rem",
      },
      caption: {
        gap: "0.75rem",
      },
      title: {
        fontSize: "1.125rem",
        fontWeight: "700",
      },
      subtitle: {
        color: flow.muted,
      },
    },

    panel: {
      root: {
        background: "rgb(11 19 40 / 0.9)",
        borderColor: flow.border,
        color: flow.text,
        borderRadius: radius.lg,
      },
      header: {
        background: flow.surface2,
        color: flow.text,
        padding: "1rem 1.25rem",
        borderColor: flow.border,
        borderWidth: "1px",
        borderRadius: radius.lg,
      },
      toggleableHeader: {
        padding: "1rem 1.25rem",
      },
      title: {
        fontWeight: "700",
      },
      content: {
        padding: "1rem 1.25rem",
      },
      footer: {
        padding: "1rem 1.25rem",
      },
    },

    dialog: {
      root: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: "rgb(38 52 95 / 0.8)",
        color: flow.text,
        borderRadius: radius.lg,
        shadow: glow.card,
      },
      header: {
        padding: "1rem 1.25rem",
        gap: "0.75rem",
      },
      title: {
        fontSize: "1rem",
        fontWeight: "700",
      },
      content: {
        padding: "1rem 1.25rem",
      },
      footer: {
        padding: "1rem 1.25rem",
        gap: "0.75rem",
      },
    },

    inputtext: {
      root: {
        background: flow.surface,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        filledBackground: flow.surface2,
        filledHoverBackground: "#151f3f",
        filledFocusBackground: flow.surface,
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        focusBorderColor: flow.violet,
        invalidBorderColor: flow.danger,
        color: flow.text,
        disabledColor: flow.subtle,
        placeholderColor: flow.subtle,
        invalidPlaceholderColor: "#ffa3b6",
        shadow: "none",
        paddingX: "1rem",
        paddingY: "0.625rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        transitionDuration: "160ms",
      },
    },

    textarea: {
      root: {
        background: flow.surface,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        filledBackground: flow.surface2,
        filledHoverBackground: "#151f3f",
        filledFocusBackground: flow.surface,
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        focusBorderColor: flow.violet,
        invalidBorderColor: flow.danger,
        color: flow.text,
        disabledColor: flow.subtle,
        placeholderColor: flow.subtle,
        invalidPlaceholderColor: "#ffa3b6",
        shadow: "none",
        paddingX: "1rem",
        paddingY: "0.875rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        transitionDuration: "160ms",
      },
    },

    select: {
      root: {
        background: flow.surface,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        filledBackground: flow.surface2,
        filledHoverBackground: "#151f3f",
        filledFocusBackground: flow.surface,
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        focusBorderColor: flow.violet,
        invalidBorderColor: flow.danger,
        color: flow.text,
        disabledColor: flow.subtle,
        placeholderColor: flow.subtle,
        invalidPlaceholderColor: "#ffa3b6",
        shadow: "none",
        paddingX: "1rem",
        paddingY: "0.625rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        transitionDuration: "160ms",
      },
      dropdown: {
        width: "2.5rem",
        color: flow.muted,
      },
      overlay: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        borderRadius: radius.md,
        color: flow.text,
        shadow: glow.card,
      },
      list: {
        padding: "0.5rem",
        gap: "0.25rem",
      },
      option: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        selectedBackground: "rgb(124 60 255 / 0.2)",
        selectedFocusBackground: "rgb(124 60 255 / 0.26)",
        color: flow.muted,
        focusColor: "#ffffff",
        selectedColor: "#ffffff",
        selectedFocusColor: "#ffffff",
        padding: "0.625rem 0.875rem",
        borderRadius: radius.sm,
      },
      optionGroup: {
        background: flow.surface2,
        color: flow.text,
        fontWeight: "700",
        padding: "0.5rem 0.875rem",
      },
      clearIcon: {
        color: flow.muted,
      },
      checkmark: {
        color: flow.lilac,
        gutterStart: "0.5rem",
        gutterEnd: "0.5rem",
      },
      emptyMessage: {
        padding: "0.75rem 0.875rem",
      },
    },

    multiselect: {
      root: {
        background: flow.surface,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        filledBackground: flow.surface2,
        filledHoverBackground: "#151f3f",
        filledFocusBackground: flow.surface,
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        focusBorderColor: flow.violet,
        invalidBorderColor: flow.danger,
        color: flow.text,
        disabledColor: flow.subtle,
        placeholderColor: flow.subtle,
        invalidPlaceholderColor: "#ffa3b6",
        shadow: "none",
        paddingX: "1rem",
        paddingY: "0.75rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        transitionDuration: "160ms",
      },
      dropdown: {
        width: "2.5rem",
        color: flow.muted,
      },
      overlay: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        borderRadius: radius.md,
        color: flow.text,
        shadow: glow.card,
      },
      list: {
        padding: "0.5rem",
        gap: "0.25rem",
      },
      option: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        selectedBackground: "rgb(124 60 255 / 0.2)",
        selectedFocusBackground: "rgb(124 60 255 / 0.26)",
        color: flow.muted,
        focusColor: "#ffffff",
        selectedColor: "#ffffff",
        selectedFocusColor: "#ffffff",
        padding: "0.625rem 0.875rem",
        borderRadius: radius.sm,
        gap: "0.5rem",
      },
      optionGroup: {
        background: flow.surface2,
        color: flow.text,
        fontWeight: "700",
        padding: "0.5rem 0.875rem",
      },
      clearIcon: {
        color: flow.muted,
      },
      chip: {
        borderRadius: radius.sm,
      },
      emptyMessage: {
        padding: "0.75rem 0.875rem",
      },
    },

    checkbox: {
      root: {
        borderRadius: radius.xs,
        width: "1.25rem",
        height: "1.25rem",
        background: flow.surface,
        checkedBackground: flow.violet,
        checkedHoverBackground: flow.lilac,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        filledBackground: flow.surface2,
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        focusBorderColor: flow.violet,
        checkedBorderColor: flow.violet,
        checkedHoverBorderColor: flow.lilac,
        checkedFocusBorderColor: flow.violet,
        checkedDisabledBorderColor: flow.border,
        invalidBorderColor: flow.danger,
        shadow: "none",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        transitionDuration: "160ms",
      },
      icon: {
        size: "0.75rem",
        color: "#ffffff",
        checkedColor: "#ffffff",
        checkedHoverColor: "#ffffff",
      },
    },

    radiobutton: {
      root: {
        width: "1.25rem",
        height: "1.25rem",
        background: flow.surface,
        checkedBackground: flow.violet,
        checkedHoverBackground: flow.lilac,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        filledBackground: flow.surface2,
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        focusBorderColor: flow.violet,
        checkedBorderColor: flow.violet,
        checkedHoverBorderColor: flow.lilac,
        checkedFocusBorderColor: flow.violet,
        checkedDisabledBorderColor: flow.border,
        invalidBorderColor: flow.danger,
        shadow: "none",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        transitionDuration: "160ms",
      },
      icon: {
        size: "0.625rem",
        checkedColor: "#ffffff",
        checkedHoverColor: "#ffffff",
        disabledColor: flow.subtle,
      },
    },

    toggleswitch: {
      root: {
        width: "3rem",
        height: "1.75rem",
        borderRadius: "999px",
        gap: "0.5rem",
        shadow: "none",
        borderWidth: "1px",
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        checkedBorderColor: flow.violet,
        checkedHoverBorderColor: flow.lilac,
        invalidBorderColor: flow.danger,
        transitionDuration: "160ms",
        slideDuration: "160ms",
        background: flow.surface2,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        hoverBackground: flow.surface,
        checkedBackground: `linear-gradient(135deg, ${flow.blue}, ${flow.violet})`,
        checkedHoverBackground: `linear-gradient(135deg, ${flow.cyan}, ${flow.violet})`,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      handle: {
        borderRadius: "999px",
        size: "1.25rem",
        background: flow.text,
        disabledBackground: flow.subtle,
        hoverBackground: "#ffffff",
        checkedBackground: "#ffffff",
        checkedHoverBackground: "#ffffff",
        color: flow.bg,
        hoverColor: flow.bg,
        checkedColor: flow.bg,
        checkedHoverColor: flow.bg,
      },
    },

    datatable: {
      root: {
        transitionDuration: "160ms",
        borderColor: flow.border,
      },
      header: {
        background: flow.surface2,
        borderColor: flow.border,
        color: flow.text,
        borderWidth: "1px",
        padding: "0.875rem 1rem",
      },
      headerCell: {
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.08)",
        selectedBackground: "rgb(124 60 255 / 0.18)",
        borderColor: flow.border,
        color: flow.muted,
        hoverColor: flow.text,
        selectedColor: flow.text,
        gap: "0.5rem",
        padding: "0.875rem 1rem",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      columnTitle: {
        fontWeight: "700",
      },
      row: {
        background: "transparent",
        hoverBackground: "rgb(124 60 255 / 0.08)",
        selectedBackground: "rgb(124 60 255 / 0.18)",
        color: flow.text,
        hoverColor: flow.text,
        selectedColor: flow.text,
        stripedBackground: "rgb(17 26 53 / 0.55)",
      },
      bodyCell: {
        borderColor: flow.border,
        padding: "0.875rem 1rem",
        selectedBorderColor: flow.border,
      },
      footerCell: {
        background: flow.surface2,
        borderColor: flow.border,
        color: flow.text,
        padding: "0.875rem 1rem",
      },
      columnFooter: {
        fontWeight: "700",
      },
      footer: {
        background: flow.surface2,
        borderColor: flow.border,
        color: flow.text,
        borderWidth: "1px",
        padding: "0.875rem 1rem",
      },
      filter: {
        inlineGap: "0.5rem",
        overlaySelect: {
          background: "rgb(11 19 40 / 0.96)",
          borderColor: flow.border,
          borderRadius: radius.md,
          color: flow.text,
          shadow: glow.card,
        },
        overlayPopover: {
          background: "rgb(11 19 40 / 0.96)",
          borderColor: flow.border,
          borderRadius: radius.md,
          color: flow.text,
          shadow: glow.card,
          padding: "0.75rem",
          gap: "0.75rem",
        },
        rule: {
          borderColor: flow.border,
        },
        constraintList: {
          padding: "0.5rem",
          gap: "0.5rem",
        },
        constraint: {
          focusBackground: "rgb(124 60 255 / 0.12)",
          selectedBackground: "rgb(124 60 255 / 0.2)",
          selectedFocusBackground: "rgb(124 60 255 / 0.26)",
          color: flow.muted,
          focusColor: flow.text,
          selectedColor: flow.text,
          selectedFocusColor: flow.text,
          padding: "0.5rem 0.75rem",
          borderRadius: radius.sm,
          separator: {
            borderColor: flow.border,
          },
        },
      },
      paginatorTop: {
        borderColor: flow.border,
        borderWidth: "1px",
      },
      paginatorBottom: {
        borderColor: flow.border,
        borderWidth: "1px",
      },
    },

    paginator: {
      root: {
        padding: "0.75rem 1rem",
        gap: "0.5rem",
        borderRadius: radius.md,
        background: flow.surface2,
        color: flow.muted,
        transitionDuration: "160ms",
      },
      navButton: {
        background: flow.surface,
        hoverBackground: "rgb(124 60 255 / 0.12)",
        selectedBackground: "rgb(124 60 255 / 0.22)",
        color: flow.muted,
        hoverColor: "#ffffff",
        selectedColor: "#ffffff",
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      currentPageReport: {
        color: flow.text,
      },
      jumpToPageInput: {
        maxWidth: "5rem",
      },
    },

    tabs: {
      root: {
        transitionDuration: "160ms",
      },
      tablist: {
        borderWidth: "1px",
        background: "transparent",
        borderColor: flow.border,
      },
      tab: {
        background: "transparent",
        hoverBackground: flow.surface,
        activeBackground: flow.surface,
        borderWidth: "1px",
        borderColor: "transparent",
        hoverBorderColor: flow.border,
        activeBorderColor: flow.violet,
        color: flow.muted,
        hoverColor: flow.text,
        activeColor: "#ffffff",
        padding: "0.75rem 1rem",
        fontWeight: "600",
        margin: "0.25rem",
        gap: "0.5rem",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      tabpanel: {
        background: "transparent",
        color: flow.text,
        padding: "1rem 0",
      },
    },

    tag: {
      root: {
        fontSize: "0.75rem",
        fontWeight: "600",
        padding: "0.25rem 0.625rem",
        gap: "0.25rem",
        borderRadius: radius.sm,
        roundedBorderRadius: "999px",
      },
      icon: {
        size: "0.75rem",
      },
      primary: {
        background: "rgb(124 60 255 / 0.2)",
        color: flow.lilac,
      },
      secondary: {
        background: "rgb(17 26 53 / 0.85)",
        color: flow.text,
      },
      success: {
        background: "rgb(24 200 255 / 0.18)",
        color: flow.cyan,
      },
      info: {
        background: "rgb(9 120 255 / 0.18)",
        color: flow.blue,
      },
      warn: {
        background: "rgb(245 185 95 / 0.18)",
        color: flow.warning,
      },
      danger: {
        background: "rgb(255 107 138 / 0.18)",
        color: flow.danger,
      },
      contrast: {
        background: flow.text,
        color: flow.bg,
      },
    },

    badge: {
      root: {
        borderRadius: radius.sm,
        padding: "0 0.5rem",
        fontSize: "0.75rem",
        fontWeight: "600",
        minWidth: "1.5rem",
        height: "1.5rem",
      },
      dot: {
        size: "0.5rem",
      },
      sm: {
        fontSize: "0.625rem",
        minWidth: "1.25rem",
        height: "1.25rem",
      },
      lg: {
        fontSize: "0.875rem",
        minWidth: "1.75rem",
        height: "1.75rem",
      },
      xl: {
        fontSize: "1rem",
        minWidth: "2rem",
        height: "2rem",
      },
      primary: {
        background: flow.violet,
        color: "#ffffff",
      },
      secondary: {
        background: flow.surface2,
        color: flow.text,
      },
      success: {
        background: flow.cyan,
        color: flow.bg,
      },
      info: {
        background: flow.blue,
        color: "#ffffff",
      },
      warn: {
        background: flow.warning,
        color: flow.bg,
      },
      danger: {
        background: flow.danger,
        color: "#ffffff",
      },
      contrast: {
        background: flow.text,
        color: flow.bg,
      },
    },

    toast: {
      root: {
        width: "22rem",
        borderRadius: radius.lg,
        borderWidth: "1px",
        transitionDuration: "160ms",
        blur: "12px",
      },
      icon: {
        size: "1.25rem",
      },
      content: {
        padding: "0.875rem 1rem",
        gap: "0.75rem",
      },
      text: {
        gap: "0.25rem",
      },
      summary: {
        fontWeight: "700",
        fontSize: "0.95rem",
      },
      detail: {
        fontWeight: "400",
        fontSize: "0.875rem",
      },
      closeButton: {
        width: "2rem",
        height: "2rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          offset: "2px",
        },
      },
      closeIcon: {
        size: "0.875rem",
      },
      info: {
        background: "rgb(9 120 255 / 0.12)",
        borderColor: "rgb(9 120 255 / 0.28)",
        color: flow.text,
        detailColor: flow.muted,
        shadow: glow.blue,
        closeButton: {
          hoverBackground: "rgb(9 120 255 / 0.18)",
          focusRing: {
            color: flow.blue,
            shadow: "0 0 0 4px rgb(9 120 255 / 0.24)",
          },
        },
      },
      success: {
        background: "rgb(24 200 255 / 0.12)",
        borderColor: "rgb(24 200 255 / 0.28)",
        color: flow.text,
        detailColor: flow.muted,
        shadow: glow.violet,
        closeButton: {
          hoverBackground: "rgb(24 200 255 / 0.18)",
          focusRing: {
            color: flow.cyan,
            shadow: "0 0 0 4px rgb(24 200 255 / 0.24)",
          },
        },
      },
      warn: {
        background: "rgb(245 185 95 / 0.12)",
        borderColor: "rgb(245 185 95 / 0.28)",
        color: flow.text,
        detailColor: flow.muted,
        shadow: glow.card,
        closeButton: {
          hoverBackground: "rgb(245 185 95 / 0.18)",
          focusRing: {
            color: flow.warning,
            shadow: "0 0 0 4px rgb(245 185 95 / 0.24)",
          },
        },
      },
      error: {
        background: "rgb(255 107 138 / 0.12)",
        borderColor: "rgb(255 107 138 / 0.28)",
        color: flow.text,
        detailColor: flow.muted,
        shadow: glow.card,
        closeButton: {
          hoverBackground: "rgb(255 107 138 / 0.18)",
          focusRing: {
            color: flow.danger,
            shadow: "0 0 0 4px rgb(255 107 138 / 0.24)",
          },
        },
      },
      secondary: {
        background: flow.surface2,
        borderColor: flow.border,
        color: flow.text,
        detailColor: flow.muted,
        shadow: glow.card,
        closeButton: {
          hoverBackground: "rgb(124 60 255 / 0.12)",
          focusRing: {
            color: flow.lilac,
            shadow: "0 0 0 4px rgb(124 60 255 / 0.24)",
          },
        },
      },
      contrast: {
        background: flow.text,
        borderColor: flow.text,
        color: flow.bg,
        detailColor: flow.bgSoft,
        shadow: glow.card,
        closeButton: {
          hoverBackground: "rgb(5 8 20 / 0.08)",
          focusRing: {
            color: flow.bg,
            shadow: "0 0 0 4px rgb(5 8 20 / 0.16)",
          },
        },
      },
    },

    tooltip: {
      root: {
        maxWidth: "16rem",
        gutter: "0.5rem",
        shadow: glow.card,
        padding: "0.5rem 0.75rem",
        borderRadius: radius.sm,
        background: flow.surface2,
        color: flow.text,
      },
    },

    message: {
      root: {
        borderRadius: radius.md,
        borderWidth: "1px",
        transitionDuration: "160ms",
      },
      content: {
        padding: "0.875rem 1rem",
        gap: "0.75rem",
      },
      text: {
        fontSize: "0.875rem",
        fontWeight: "500",
      },
      icon: {
        size: "1.125rem",
      },
      closeButton: {
        width: "1.75rem",
        height: "1.75rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          offset: "2px",
        },
      },
      closeIcon: {
        size: "0.875rem",
      },
      info: {
        background: "rgb(9 120 255 / 0.12)",
        borderColor: "rgb(9 120 255 / 0.28)",
        color: flow.text,
        shadow: glow.blue,
        closeButton: {
          hoverBackground: "rgb(9 120 255 / 0.18)",
          focusRing: {
            color: flow.blue,
            shadow: "0 0 0 4px rgb(9 120 255 / 0.24)",
          },
        },
        outlined: {
          color: flow.blue,
          borderColor: "rgb(9 120 255 / 0.4)",
        },
        simple: {
          color: flow.blue,
        },
      },
      success: {
        background: "rgb(24 200 255 / 0.12)",
        borderColor: "rgb(24 200 255 / 0.28)",
        color: flow.text,
        shadow: glow.violet,
        closeButton: {
          hoverBackground: "rgb(24 200 255 / 0.18)",
          focusRing: {
            color: flow.cyan,
            shadow: "0 0 0 4px rgb(24 200 255 / 0.24)",
          },
        },
        outlined: {
          color: flow.cyan,
          borderColor: "rgb(24 200 255 / 0.4)",
        },
        simple: {
          color: flow.cyan,
        },
      },
      warn: {
        background: "rgb(245 185 95 / 0.12)",
        borderColor: "rgb(245 185 95 / 0.28)",
        color: flow.text,
        shadow: glow.card,
        closeButton: {
          hoverBackground: "rgb(245 185 95 / 0.18)",
          focusRing: {
            color: flow.warning,
            shadow: "0 0 0 4px rgb(245 185 95 / 0.24)",
          },
        },
        outlined: {
          color: flow.warning,
          borderColor: "rgb(245 185 95 / 0.4)",
        },
        simple: {
          color: flow.warning,
        },
      },
      error: {
        background: "rgb(255 107 138 / 0.12)",
        borderColor: "rgb(255 107 138 / 0.28)",
        color: flow.text,
        shadow: glow.card,
        closeButton: {
          hoverBackground: "rgb(255 107 138 / 0.18)",
          focusRing: {
            color: flow.danger,
            shadow: "0 0 0 4px rgb(255 107 138 / 0.24)",
          },
        },
        outlined: {
          color: flow.danger,
          borderColor: "rgb(255 107 138 / 0.4)",
        },
        simple: {
          color: flow.danger,
        },
      },
    },

    avatar: {
      root: {
        width: "2.5rem",
        height: "2.5rem",
        fontSize: "0.875rem",
        background: flow.surface2,
        color: flow.text,
        borderRadius: radius.md,
      },
      icon: {
        size: "1rem",
      },
      group: {
        borderColor: flow.surface,
        offset: "-0.5rem",
      },
      lg: {
        width: "3rem",
        height: "3rem",
        fontSize: "1rem",
        icon: {
          size: "1.125rem",
        },
        group: {
          offset: "-0.625rem",
        },
      },
      xl: {
        width: "4rem",
        height: "4rem",
        fontSize: "1.125rem",
        icon: {
          size: "1.25rem",
        },
        group: {
          offset: "-0.75rem",
        },
      },
    },

    chip: {
      root: {
        borderRadius: radius.sm,
        paddingX: "0.75rem",
        paddingY: "0.375rem",
        gap: "0.5rem",
        transitionDuration: "160ms",
        background: flow.surface,
        color: flow.text,
      },
      image: {
        width: "1.5rem",
        height: "1.5rem",
      },
      icon: {
        size: "0.875rem",
        color: flow.muted,
      },
      removeIcon: {
        size: "0.875rem",
        color: flow.muted,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
    },

    progressbar: {
      root: {
        background: flow.surface2,
        borderRadius: radius.md,
        height: "0.5rem",
      },
      value: {
        background: `linear-gradient(135deg, ${flow.blue}, ${flow.violet})`,
      },
      label: {
        color: flow.text,
        fontSize: "0.875rem",
        fontWeight: "600",
      },
    },

    skeleton: {
      root: {
        borderRadius: radius.md,
        background: "rgb(17 26 53 / 0.85)",
        animationBackground:
          "linear-gradient(90deg, rgb(17 26 53 / 0.85), rgb(36 48 86 / 0.85), rgb(17 26 53 / 0.85))",
      },
    },

    image: {
      root: {
        transitionDuration: "160ms",
      },
      preview: {
        icon: {
          size: "1.25rem",
        },
        mask: {
          background: "rgb(5 8 20 / 0.75)",
          color: flow.text,
        },
      },
      toolbar: {
        blur: "12px",
        background: "rgb(11 19 40 / 0.88)",
        borderColor: flow.border,
        borderWidth: "1px",
        borderRadius: radius.md,
        padding: "0.5rem",
        gap: "0.5rem",
        position: {
          top: "0.75rem",
          right: "0.75rem",
          bottom: "auto",
          left: "auto",
        },
      },
      action: {
        hoverBackground: "rgb(124 60 255 / 0.12)",
        color: flow.text,
        hoverColor: "#ffffff",
        size: "2rem",
        iconSize: "1rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
    },

    fileupload: {
      root: {
        background: flow.surface,
        borderColor: flow.border,
        color: flow.text,
        borderRadius: radius.md,
        transitionDuration: "160ms",
      },
      header: {
        background: flow.surface2,
        color: flow.text,
        padding: "0.875rem 1rem",
        borderColor: flow.border,
        borderWidth: "1px",
        borderRadius: radius.md,
        gap: "0.75rem",
      },
      content: {
        highlightBorderColor: flow.lilac,
        padding: "1rem",
        gap: "0.75rem",
      },
      file: {
        padding: "0.875rem 1rem",
        gap: "0.75rem",
        borderColor: flow.border,
        info: {
          gap: "0.75rem",
        },
      },
      fileList: {
        gap: "0.5rem",
      },
      progressbar: {
        height: "0.5rem",
      },
      basic: {
        gap: "0.75rem",
      },
    },

    password: {
      meter: {
        background: flow.surface2,
        borderRadius: radius.md,
        height: "0.5rem",
      },
      icon: {
        color: flow.muted,
      },
      overlay: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        borderRadius: radius.md,
        color: flow.text,
        padding: "0.875rem 1rem",
        shadow: glow.card,
      },
      content: {
        gap: "0.75rem",
      },
      strength: {
        weakBackground: flow.danger,
        mediumBackground: flow.warning,
        strongBackground: flow.cyan,
      },
    },

    menu: {
      root: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        color: flow.text,
        borderRadius: radius.md,
        shadow: glow.card,
        transitionDuration: "160ms",
      },
      list: {
        padding: "0.5rem",
        gap: "0.25rem",
      },
      item: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        color: flow.muted,
        focusColor: flow.text,
        padding: "0.625rem 0.875rem",
        borderRadius: radius.sm,
        gap: "0.5rem",
        icon: {
          color: flow.muted,
          focusColor: flow.text,
        },
      },
      submenuLabel: {
        padding: "0.5rem 0.875rem",
        fontWeight: "700",
        background: flow.surface2,
        color: flow.text,
      },
      separator: {
        borderColor: flow.border,
      },
    },

    menubar: {
      root: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        borderRadius: radius.md,
        color: flow.text,
        gap: "0.5rem",
        padding: "0.5rem 0.75rem",
        transitionDuration: "160ms",
      },
      baseItem: {
        borderRadius: radius.sm,
        padding: "0.5rem 0.75rem",
      },
      item: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        activeBackground: "rgb(124 60 255 / 0.18)",
        color: flow.muted,
        focusColor: flow.text,
        activeColor: flow.text,
        padding: "0.5rem 0.75rem",
        borderRadius: radius.sm,
        gap: "0.5rem",
        icon: {
          color: flow.muted,
          focusColor: flow.text,
          activeColor: flow.text,
        },
      },
      submenu: {
        padding: "0.5rem",
        gap: "0.25rem",
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        borderRadius: radius.md,
        shadow: glow.card,
        mobileIndent: "1rem",
        icon: {
          size: "0.875rem",
          color: flow.muted,
          focusColor: flow.text,
          activeColor: flow.text,
        },
      },
      separator: {
        borderColor: flow.border,
      },
      mobileButton: {
        borderRadius: radius.md,
        size: "2.5rem",
        color: flow.text,
        hoverColor: "#ffffff",
        hoverBackground: "rgb(124 60 255 / 0.12)",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
    },

    popover: {
      root: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        color: flow.text,
        borderRadius: radius.md,
        shadow: glow.card,
        gutter: "0.5rem",
        arrowOffset: "1rem",
      },
      content: {
        padding: "1rem",
      },
    },

    drawer: {
      root: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        color: flow.text,
        shadow: glow.card,
      },
      header: {
        padding: "1rem 1.25rem",
      },
      title: {
        fontSize: "1rem",
        fontWeight: "700",
      },
      content: {
        padding: "1rem 1.25rem",
      },
      footer: {
        padding: "1rem 1.25rem",
      },
    },

    confirmdialog: {
      icon: {
        size: "2.5rem",
        color: flow.warning,
      },
      content: {
        gap: "1rem",
      },
    },

    confirmpopup: {
      root: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        color: flow.text,
        borderRadius: radius.md,
        shadow: glow.card,
        gutter: "0.5rem",
        arrowOffset: "1rem",
      },
      content: {
        padding: "1rem",
        gap: "0.75rem",
      },
      icon: {
        size: "2rem",
        color: flow.warning,
      },
      footer: {
        gap: "0.5rem",
        padding: "0.75rem 0 0",
      },
    },

    toolbar: {
      root: {
        background: "rgb(11 19 40 / 0.9)",
        borderColor: flow.border,
        borderRadius: radius.md,
        color: flow.text,
        gap: "0.75rem",
        padding: "0.75rem 1rem",
      },
    },

    inputnumber: {
      root: {
        transitionDuration: "160ms",
      },
      button: {
        width: "2.25rem",
        borderRadius: radius.sm,
        verticalPadding: "0.5rem",
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.12)",
        activeBackground: "rgb(124 60 255 / 0.18)",
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        activeBorderColor: flow.violet,
        color: flow.text,
        hoverColor: "#ffffff",
        activeColor: "#ffffff",
      },
    },

    accordion: {
      root: {
        transitionDuration: "160ms",
      },
      panel: {
        borderWidth: "1px",
        borderColor: flow.border,
      },
      header: {
        color: flow.muted,
        hoverColor: flow.text,
        activeColor: flow.text,
        activeHoverColor: flow.text,
        padding: "0.875rem 1rem",
        fontWeight: "700",
        borderRadius: radius.md,
        borderWidth: "1px",
        borderColor: flow.border,
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.08)",
        activeBackground: "rgb(124 60 255 / 0.18)",
        activeHoverBackground: "rgb(124 60 255 / 0.22)",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        toggleIcon: {
          color: flow.muted,
          hoverColor: flow.text,
          activeColor: flow.text,
          activeHoverColor: flow.text,
        },
        first: {
          topBorderRadius: radius.md,
          borderWidth: "1px",
        },
        last: {
          bottomBorderRadius: radius.md,
          activeBottomBorderRadius: radius.md,
        },
      },
      content: {
        borderWidth: "1px",
        borderColor: flow.border,
        background: "rgb(11 19 40 / 0.86)",
        color: flow.text,
        padding: "1rem",
      },
    },

    divider: {
      root: {
        borderColor: flow.border,
      },
      content: {
        background: flow.surface,
        color: flow.text,
      },
      horizontal: {
        margin: "1rem 0",
        padding: "0 1rem",
        content: {
          padding: "0 0.75rem",
        },
      },
      vertical: {
        margin: "0 1rem",
        padding: "1rem 0",
        content: {
          padding: "0.75rem 0",
        },
      },
    },

    stepper: {
      root: {
        transitionDuration: "160ms",
      },
      separator: {
        background: flow.border,
        activeBackground: flow.violet,
        margin: "0 0.75rem",
        size: "2px",
      },
      step: {
        padding: "0",
        gap: "0.75rem",
      },
      stepHeader: {
        padding: "0.5rem 0.75rem",
        borderRadius: radius.md,
        gap: "0.75rem",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      stepTitle: {
        color: flow.muted,
        activeColor: flow.text,
        fontWeight: "700",
      },
      stepNumber: {
        background: flow.surface2,
        activeBackground: flow.violet,
        borderColor: flow.border,
        activeBorderColor: flow.violet,
        color: flow.text,
        activeColor: "#ffffff",
        size: "2rem",
        fontSize: "0.875rem",
        fontWeight: "700",
        borderRadius: "999px",
        shadow: glow.card,
      },
      steppanels: {
        padding: "1rem 0",
      },
      steppanel: {
        background: "rgb(11 19 40 / 0.86)",
        color: flow.text,
        padding: "1rem",
        indent: "0.75rem",
      },
    },

    tree: {
      root: {
        background: "rgb(11 19 40 / 0.9)",
        color: flow.text,
        padding: "0.5rem",
        gap: "0.25rem",
        indent: "1rem",
        transitionDuration: "160ms",
      },
      node: {
        padding: "0.5rem 0.75rem",
        borderRadius: radius.md,
        hoverBackground: "rgb(124 60 255 / 0.08)",
        selectedBackground: "rgb(124 60 255 / 0.18)",
        color: flow.muted,
        hoverColor: flow.text,
        selectedColor: flow.text,
        gap: "0.5rem",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      nodeIcon: {
        color: flow.muted,
        hoverColor: flow.text,
        selectedColor: flow.text,
      },
      nodeToggleButton: {
        borderRadius: radius.sm,
        size: "1.75rem",
        hoverBackground: "rgb(124 60 255 / 0.12)",
        selectedHoverBackground: "rgb(124 60 255 / 0.18)",
        color: flow.muted,
        hoverColor: flow.text,
        selectedHoverColor: flow.text,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      loadingIcon: {
        size: "1rem",
      },
      filter: {
        margin: "0.5rem 0 0",
      },
    },

    treetable: {
      root: {
        transitionDuration: "160ms",
        borderColor: flow.border,
      },
      header: {
        background: flow.surface2,
        borderColor: flow.border,
        color: flow.text,
        borderWidth: "1px",
        padding: "0.875rem 1rem",
      },
      headerCell: {
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.08)",
        selectedBackground: "rgb(124 60 255 / 0.18)",
        borderColor: flow.border,
        color: flow.muted,
        hoverColor: flow.text,
        selectedColor: flow.text,
        gap: "0.5rem",
        padding: "0.875rem 1rem",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      columnTitle: {
        fontWeight: "700",
      },
      row: {
        background: "transparent",
        hoverBackground: "rgb(124 60 255 / 0.08)",
        selectedBackground: "rgb(124 60 255 / 0.18)",
        color: flow.text,
        hoverColor: flow.text,
        selectedColor: flow.text,
      },
      bodyCell: {
        borderColor: flow.border,
        padding: "0.875rem 1rem",
        gap: "0.5rem",
        selectedBorderColor: flow.border,
      },
      footerCell: {
        background: flow.surface2,
        borderColor: flow.border,
        color: flow.text,
        padding: "0.875rem 1rem",
      },
      columnFooter: {
        fontWeight: "700",
      },
      footer: {
        background: flow.surface2,
        borderColor: flow.border,
        color: flow.text,
        borderWidth: "1px",
        padding: "0.875rem 1rem",
      },
      columnResizer: {
        width: "0.25rem",
      },
      resizeIndicator: {
        width: "0.125rem",
        color: flow.lilac,
      },
      sortIcon: {
        color: flow.muted,
        hoverColor: flow.text,
        size: "0.875rem",
      },
      loadingIcon: {
        size: "1rem",
      },
      nodeToggleButton: {
        hoverBackground: "rgb(124 60 255 / 0.12)",
        selectedHoverBackground: "rgb(124 60 255 / 0.18)",
        color: flow.muted,
        hoverColor: flow.text,
        selectedHoverColor: flow.text,
        size: "1.75rem",
        borderRadius: radius.sm,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      paginatorTop: {
        borderColor: flow.border,
        borderWidth: "1px",
      },
      paginatorBottom: {
        borderColor: flow.border,
        borderWidth: "1px",
      },
    },

    fieldset: {
      root: {
        background: "rgb(11 19 40 / 0.9)",
        borderColor: flow.border,
        borderRadius: radius.lg,
        color: flow.text,
        padding: "1rem 1.25rem",
        transitionDuration: "160ms",
      },
      legend: {
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.08)",
        color: flow.text,
        hoverColor: flow.text,
        borderRadius: radius.md,
        borderWidth: "1px",
        borderColor: flow.border,
        padding: "0.5rem 0.75rem",
        gap: "0.5rem",
        fontWeight: "700",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      toggleIcon: {
        color: flow.muted,
        hoverColor: flow.text,
      },
      content: {
        padding: "0.75rem 0 0",
      },
    },

    panelmenu: {
      root: {
        gap: "0.5rem",
        transitionDuration: "160ms",
      },
      panel: {
        background: "rgb(11 19 40 / 0.9)",
        borderColor: flow.border,
        borderWidth: "1px",
        color: flow.text,
        padding: "0.5rem",
        borderRadius: radius.lg,
        first: {
          borderWidth: "1px",
          topBorderRadius: radius.lg,
        },
        last: {
          borderWidth: "1px",
          bottomBorderRadius: radius.lg,
        },
      },
      item: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        color: flow.muted,
        focusColor: flow.text,
        gap: "0.5rem",
        padding: "0.625rem 0.875rem",
        borderRadius: radius.sm,
        icon: {
          color: flow.muted,
          focusColor: flow.text,
        },
      },
      submenu: {
        indent: "1rem",
      },
      submenuIcon: {
        color: flow.muted,
        focusColor: flow.text,
      },
    },

    timeline: {
      event: {
        minHeight: "3rem",
      },
      horizontal: {
        eventContent: {
          padding: "0 0 0 1rem",
        },
      },
      vertical: {
        eventContent: {
          padding: "0 0 1rem 1rem",
        },
      },
      eventMarker: {
        size: "1rem",
        borderRadius: "999px",
        borderWidth: "2px",
        background: flow.surface2,
        borderColor: flow.violet,
        content: {
          borderRadius: "999px",
          size: "0.5rem",
          background: `linear-gradient(135deg, ${flow.blue}, ${flow.violet})`,
          insetShadow: "0 0 0 4px rgb(124 60 255 / 0.18)",
        },
      },
      eventConnector: {
        color: flow.border,
        size: "2px",
      },
    },

    selectbutton: {
      root: {
        borderRadius: radius.md,
        invalidBorderColor: flow.danger,
      },
    },

    autocomplete: {
      root: {
        background: flow.surface,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        filledBackground: flow.surface2,
        filledHoverBackground: "#151f3f",
        filledFocusBackground: flow.surface,
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        focusBorderColor: flow.violet,
        invalidBorderColor: flow.danger,
        color: flow.text,
        disabledColor: flow.subtle,
        placeholderColor: flow.subtle,
        invalidPlaceholderColor: "#ffa3b6",
        shadow: "none",
        paddingX: "1rem",
        paddingY: "0.625rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        transitionDuration: "160ms",
      },
      overlay: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        borderRadius: radius.md,
        color: flow.text,
        shadow: glow.card,
      },
      list: {
        padding: "0.5rem",
        gap: "0.25rem",
      },
      option: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        selectedBackground: "rgb(124 60 255 / 0.2)",
        selectedFocusBackground: "rgb(124 60 255 / 0.26)",
        color: flow.muted,
        focusColor: "#ffffff",
        selectedColor: "#ffffff",
        selectedFocusColor: "#ffffff",
        padding: "0.625rem 0.875rem",
        borderRadius: radius.sm,
      },
      optionGroup: {
        background: flow.surface2,
        color: flow.text,
        fontWeight: "700",
        padding: "0.5rem 0.875rem",
      },
      dropdown: {
        width: "2.5rem",
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        activeBorderColor: flow.violet,
        borderRadius: radius.md,
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.12)",
        activeBackground: "rgb(124 60 255 / 0.18)",
        color: flow.muted,
        hoverColor: flow.text,
        activeColor: flow.text,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
    },

    breadcrumb: {
      root: {
        padding: "0.5rem 0",
        background: "transparent",
        gap: "0.5rem",
        transitionDuration: "160ms",
      },
      item: {
        color: flow.muted,
        hoverColor: flow.text,
        borderRadius: radius.sm,
        gap: "0.375rem",
        icon: {
          color: flow.muted,
          hoverColor: flow.text,
        },
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      separator: {
        color: flow.border,
      },
    },

    contextmenu: {
      root: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        color: flow.text,
        borderRadius: radius.md,
        shadow: glow.card,
        transitionDuration: "160ms",
      },
      list: {
        padding: "0.5rem",
        gap: "0.25rem",
      },
      item: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        activeBackground: "rgb(124 60 255 / 0.18)",
        color: flow.muted,
        focusColor: flow.text,
        activeColor: flow.text,
        padding: "0.625rem 0.875rem",
        borderRadius: radius.sm,
        gap: "0.5rem",
        icon: {
          color: flow.muted,
          focusColor: flow.text,
          activeColor: flow.text,
        },
      },
      submenu: {
        mobileIndent: "1rem",
      },
      submenuIcon: {
        size: "0.875rem",
        color: flow.muted,
        focusColor: flow.text,
        activeColor: flow.text,
      },
      separator: {
        borderColor: flow.border,
      },
    },

    steps: {
      root: {
        transitionDuration: "160ms",
      },
      separator: {
        background: flow.border,
      },
      itemLink: {
        borderRadius: radius.md,
        gap: "0.5rem",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      itemLabel: {
        color: flow.muted,
        activeColor: flow.text,
        fontWeight: "700",
      },
      itemNumber: {
        background: flow.surface2,
        activeBackground: flow.violet,
        borderColor: flow.border,
        activeBorderColor: flow.violet,
        color: flow.text,
        activeColor: "#ffffff",
        size: "2rem",
        fontSize: "0.875rem",
        fontWeight: "700",
        borderRadius: "999px",
        shadow: glow.card,
      },
    },

    tabmenu: {
      root: {
        transitionDuration: "160ms",
      },
      tablist: {
        borderWidth: "1px",
        background: "transparent",
        borderColor: flow.border,
      },
      item: {
        background: "transparent",
        hoverBackground: flow.surface,
        activeBackground: flow.surface,
        borderWidth: "1px",
        borderColor: "transparent",
        hoverBorderColor: flow.border,
        activeBorderColor: flow.violet,
        color: flow.muted,
        hoverColor: flow.text,
        activeColor: "#ffffff",
        padding: "0.75rem 1rem",
        fontWeight: "600",
        margin: "0.25rem",
        gap: "0.5rem",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      itemIcon: {
        color: flow.muted,
        hoverColor: flow.text,
        activeColor: flow.text,
      },
      activeBar: {
        height: "2px",
        bottom: "0",
        background: flow.violet,
      },
    },

    inlinemessage: {
      root: {
        padding: "0.75rem 1rem",
        borderRadius: radius.md,
        gap: "0.75rem",
      },
      text: {
        fontWeight: "600",
      },
      icon: {
        size: "1.125rem",
      },
      info: {
        background: "rgb(9 120 255 / 0.12)",
        borderColor: "rgb(9 120 255 / 0.28)",
        color: flow.text,
        shadow: glow.blue,
      },
      success: {
        background: "rgb(24 200 255 / 0.12)",
        borderColor: "rgb(24 200 255 / 0.28)",
        color: flow.text,
        shadow: glow.violet,
      },
      warn: {
        background: "rgb(245 185 95 / 0.12)",
        borderColor: "rgb(245 185 95 / 0.28)",
        color: flow.text,
        shadow: glow.card,
      },
      error: {
        background: "rgb(255 107 138 / 0.12)",
        borderColor: "rgb(255 107 138 / 0.28)",
        color: flow.text,
        shadow: glow.card,
      },
      secondary: {
        background: flow.surface2,
        borderColor: flow.border,
        color: flow.text,
        shadow: glow.card,
      },
      contrast: {
        background: flow.text,
        borderColor: flow.text,
        color: flow.bg,
        shadow: glow.card,
      },
    },

    progressspinner: {
      root: {
        colorOne: flow.blue,
        colorTwo: flow.violet,
        colorThree: flow.cyan,
        colorFour: flow.lilac,
      },
    },

    rating: {
      root: {
        gap: "0.375rem",
        transitionDuration: "160ms",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      icon: {
        size: "1.25rem",
        color: flow.muted,
        hoverColor: flow.warning,
        activeColor: flow.warning,
      },
    },

    slider: {
      root: {
        transitionDuration: "160ms",
      },
      track: {
        background: flow.surface2,
        borderRadius: "999px",
        size: "0.375rem",
      },
      range: {
        background: `linear-gradient(135deg, ${flow.blue}, ${flow.violet})`,
      },
      handle: {
        width: "1.25rem",
        height: "1.25rem",
        borderRadius: "999px",
        background: flow.text,
        hoverBackground: "#ffffff",
        content: {
          borderRadius: "999px",
          background: flow.violet,
          hoverBackground: flow.lilac,
          width: "0.5rem",
          height: "0.5rem",
          shadow: glow.violet,
        },
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
    },

    splitbutton: {
      root: {
        borderRadius: radius.md,
        roundedBorderRadius: "999px",
        raisedShadow: glow.violet,
      },
    },

    togglebutton: {
      root: {
        padding: "0.5rem 1rem",
        borderRadius: radius.md,
        gap: "0.5rem",
        fontWeight: "600",
        disabledBackground: "rgb(17 26 53 / 0.7)",
        disabledBorderColor: flow.border,
        disabledColor: flow.subtle,
        invalidBorderColor: flow.danger,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        transitionDuration: "160ms",
        background: flow.surface2,
        checkedBackground: `linear-gradient(135deg, ${flow.blue}, ${flow.violet})`,
        hoverBackground: "rgb(124 60 255 / 0.12)",
        borderColor: flow.border,
        color: flow.text,
        hoverColor: flow.text,
        checkedColor: "#ffffff",
        checkedBorderColor: flow.violet,
      },
      icon: {
        disabledColor: flow.subtle,
        color: flow.muted,
        hoverColor: flow.text,
        checkedColor: flow.text,
      },
      content: {
        padding: "0.5rem 1rem",
        borderRadius: radius.md,
        checkedShadow: glow.violet,
        checkedBackground: `linear-gradient(135deg, ${flow.blue}, ${flow.violet})`,
      },
    },

    dataview: {
      root: {
        borderColor: flow.border,
        borderWidth: "1px",
        borderRadius: radius.lg,
        padding: "0.5rem",
      },
      header: {
        background: flow.surface2,
        color: flow.text,
        borderColor: flow.border,
        borderWidth: "1px",
        borderRadius: radius.lg,
        padding: "0.875rem 1rem",
      },
      content: {
        background: "rgb(11 19 40 / 0.9)",
        color: flow.text,
        borderColor: flow.border,
        borderWidth: "1px",
        borderRadius: radius.lg,
        padding: "1rem",
      },
      footer: {
        background: flow.surface2,
        color: flow.text,
        borderColor: flow.border,
        borderWidth: "1px",
        borderRadius: radius.lg,
        padding: "0.875rem 1rem",
      },
      paginatorTop: {
        borderColor: flow.border,
        borderWidth: "1px",
      },
      paginatorBottom: {
        borderColor: flow.border,
        borderWidth: "1px",
      },
    },

    listbox: {
      root: {
        background: flow.surface,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        borderColor: flow.border,
        invalidBorderColor: flow.danger,
        color: flow.text,
        disabledColor: flow.subtle,
        shadow: glow.card,
        borderRadius: radius.md,
        transitionDuration: "160ms",
      },
      list: {
        padding: "0.5rem",
        gap: "0.25rem",
        header: {
          padding: "0.5rem 0.875rem",
        },
      },
      option: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        selectedBackground: "rgb(124 60 255 / 0.2)",
        selectedFocusBackground: "rgb(124 60 255 / 0.26)",
        color: flow.muted,
        focusColor: flow.text,
        selectedColor: flow.text,
        selectedFocusColor: flow.text,
        padding: "0.625rem 0.875rem",
        borderRadius: radius.sm,
        stripedBackground: "rgb(17 26 53 / 0.45)",
      },
      optionGroup: {
        background: flow.surface2,
        color: flow.text,
        fontWeight: "700",
        padding: "0.5rem 0.875rem",
      },
      checkmark: {
        color: flow.lilac,
        gutterStart: "0.5rem",
        gutterEnd: "0.5rem",
      },
      emptyMessage: {
        padding: "0.75rem 0.875rem",
      },
    },

    megamenu: {
      root: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        borderRadius: radius.md,
        color: flow.text,
        gap: "0.5rem",
        transitionDuration: "160ms",
        horizontalOrientation: {
          padding: "0.5rem 0.75rem",
          gap: "0.5rem",
        },
        verticalOrientation: {
          padding: "0.5rem",
          gap: "0.25rem",
        },
      },
      baseItem: {
        borderRadius: radius.sm,
        padding: "0.5rem 0.75rem",
      },
      item: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        activeBackground: "rgb(124 60 255 / 0.18)",
        color: flow.muted,
        focusColor: flow.text,
        activeColor: flow.text,
        padding: "0.5rem 0.75rem",
        borderRadius: radius.sm,
        gap: "0.5rem",
        icon: {
          color: flow.muted,
          focusColor: flow.text,
          activeColor: flow.text,
        },
      },
      overlay: {
        padding: "0.5rem",
        gap: "0.25rem",
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        borderRadius: radius.md,
        color: flow.text,
        shadow: glow.card,
      },
      submenu: {
        padding: "0.5rem",
        gap: "0.25rem",
      },
      submenuLabel: {
        padding: "0.5rem 0.875rem",
        fontWeight: "700",
        background: flow.surface2,
        color: flow.text,
      },
    },

    overlaybadge: {
      root: {
        outline: {
          width: "2px",
          color: flow.lilac,
        },
      },
    },

    dock: {
      root: {
        background: "rgb(11 19 40 / 0.9)",
        borderColor: flow.border,
        padding: "0.5rem",
        borderRadius: radius.lg,
      },
      item: {
        borderRadius: radius.md,
        padding: "0.5rem",
        size: "3rem",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
    },

    inplace: {
      root: {
        padding: "0.25rem",
        borderRadius: radius.md,
        transitionDuration: "160ms",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      display: {
        hoverBackground: "rgb(124 60 255 / 0.08)",
        hoverColor: flow.text,
      },
    },

    inputgroup: {
      addon: {
        background: flow.surface2,
        borderColor: flow.border,
        color: flow.text,
        borderRadius: radius.md,
        padding: "0.625rem 0.875rem",
        minWidth: "2.75rem",
      },
    },

    inputotp: {
      root: {
        gap: "0.75rem",
      },
      input: {
        width: "3rem",
        sm: {
          width: "2.5rem",
        },
        lg: {
          width: "3.5rem",
        },
      },
    },

    knob: {
      root: {
        transitionDuration: "160ms",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      value: {
        background: `linear-gradient(135deg, ${flow.blue}, ${flow.violet})`,
      },
      range: {
        background: flow.surface2,
      },
      text: {
        color: flow.text,
      },
    },

    scrollpanel: {
      root: {
        transitionDuration: "160ms",
      },
      bar: {
        size: "0.5rem",
        borderRadius: "999px",
        background: flow.surface2,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
    },

    speeddial: {
      root: {
        gap: "0.5rem",
        transitionDuration: "160ms",
      },
    },

    datepicker: {
      root: {
        transitionDuration: "160ms",
      },
      panel: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        color: flow.text,
        borderRadius: radius.md,
        shadow: glow.card,
        padding: "0.75rem",
      },
      header: {
        background: flow.surface2,
        borderColor: flow.border,
        color: flow.text,
        padding: "0.875rem 1rem",
      },
      title: {
        gap: "0.5rem",
        fontWeight: "700",
      },
      dropdown: {
        width: "2.5rem",
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        activeBorderColor: flow.violet,
        borderRadius: radius.md,
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.12)",
        activeBackground: "rgb(124 60 255 / 0.18)",
        color: flow.muted,
        hoverColor: flow.text,
        activeColor: flow.text,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      inputIcon: {
        color: flow.muted,
      },
      selectMonth: {
        hoverBackground: "rgb(124 60 255 / 0.12)",
        color: flow.muted,
        hoverColor: flow.text,
        padding: "0.5rem 0.75rem",
        borderRadius: radius.sm,
      },
      selectYear: {
        hoverBackground: "rgb(124 60 255 / 0.12)",
        color: flow.muted,
        hoverColor: flow.text,
        padding: "0.5rem 0.75rem",
        borderRadius: radius.sm,
      },
      group: {
        borderColor: flow.border,
        gap: "0.75rem",
      },
      dayView: {
        margin: "0.5rem 0 0",
      },
      weekDay: {
        padding: "0.5rem",
        fontWeight: "700",
        color: flow.muted,
      },
      date: {
        hoverBackground: "rgb(124 60 255 / 0.12)",
        selectedBackground: "rgb(124 60 255 / 0.2)",
        rangeSelectedBackground: "rgb(124 60 255 / 0.16)",
        color: flow.text,
        hoverColor: flow.text,
        selectedColor: flow.text,
        rangeSelectedColor: flow.text,
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: radius.sm,
        padding: "0.25rem",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      monthView: {
        margin: "0.5rem 0 0",
      },
      month: {
        padding: "0.5rem 0.75rem",
        borderRadius: radius.sm,
      },
      yearView: {
        margin: "0.5rem 0 0",
      },
      year: {
        padding: "0.5rem 0.75rem",
        borderRadius: radius.sm,
      },
      buttonbar: {
        padding: "0.75rem 0 0",
        borderColor: flow.border,
      },
      timePicker: {
        padding: "0.75rem 0 0",
      },
    },

    colorpicker: {
      root: {
        transitionDuration: "160ms",
      },
      preview: {
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      panel: {
        shadow: glow.card,
        borderRadius: radius.md,
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
      },
      handle: {
        color: flow.text,
      },
    },

    carousel: {
      root: {
        transitionDuration: "160ms",
      },
      content: {
        gap: "0.75rem",
      },
      indicatorList: {
        padding: "0.5rem 0",
        gap: "0.5rem",
      },
      indicator: {
        width: "0.75rem",
        height: "0.75rem",
        borderRadius: "999px",
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.12)",
        activeBackground: flow.violet,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
    },

    editor: {
      toolbar: {
        background: flow.surface2,
        borderColor: flow.border,
        borderRadius: radius.md,
      },
      toolbarItem: {
        color: flow.muted,
        hoverColor: flow.text,
        activeColor: flow.text,
        padding: "0.5rem 0.75rem",
      },
      overlay: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        borderRadius: radius.md,
        color: flow.text,
        shadow: glow.card,
        padding: "0.5rem",
      },
      overlayOption: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        color: flow.muted,
        focusColor: flow.text,
        padding: "0.5rem 0.75rem",
        borderRadius: radius.sm,
      },
      content: {
        background: flow.surface,
        borderColor: flow.border,
        color: flow.text,
        borderRadius: radius.md,
      },
    },

    tieredmenu: {
      root: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        color: flow.text,
        borderRadius: radius.md,
        shadow: glow.card,
        transitionDuration: "160ms",
      },
      list: {
        padding: "0.5rem",
        gap: "0.25rem",
      },
      item: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        activeBackground: "rgb(124 60 255 / 0.18)",
        color: flow.muted,
        focusColor: flow.text,
        activeColor: flow.text,
        padding: "0.625rem 0.875rem",
        borderRadius: radius.sm,
        gap: "0.5rem",
        icon: {
          color: flow.muted,
          focusColor: flow.text,
          activeColor: flow.text,
        },
      },
      submenu: {
        mobileIndent: "1rem",
      },
      submenuIcon: {
        size: "0.875rem",
        color: flow.muted,
        focusColor: flow.text,
        activeColor: flow.text,
      },
      separator: {
        borderColor: flow.border,
      },
    },

    splitter: {
      root: {
        background: flow.surface,
        borderColor: flow.border,
        color: flow.text,
        transitionDuration: "160ms",
      },
      gutter: {
        background: flow.surface2,
      },
      handle: {
        size: "0.75rem",
        background: flow.violet,
        borderRadius: "999px",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
    },

    floatlabel: {
      root: {
        color: flow.muted,
        focusColor: flow.lilac,
        activeColor: flow.text,
        invalidColor: flow.danger,
        transitionDuration: "160ms",
        positionX: "0.75rem",
        positionY: "1rem",
        fontWeight: "600",
        active: {
          fontSize: "0.75rem",
          fontWeight: "700",
        },
      },
      over: {
        active: {
          top: "0.25rem",
        },
      },
      in: {
        input: {
          paddingTop: "1.25rem",
          paddingBottom: "0.5rem",
        },
        active: {
          top: "0.5rem",
        },
      },
      on: {
        borderRadius: radius.md,
        active: {
          background: flow.surface,
          padding: "0 0.25rem",
        },
      },
    },

    iconfield: {
      icon: {
        color: flow.muted,
      },
    },

    iftalabel: {
      root: {
        color: flow.muted,
        focusColor: flow.lilac,
        invalidColor: flow.danger,
        transitionDuration: "160ms",
        positionX: "0.75rem",
        top: "0.75rem",
        fontSize: "0.75rem",
        fontWeight: "600",
      },
      input: {
        paddingTop: "1.25rem",
        paddingBottom: "0.5rem",
      },
    },

    imagecompare: {
      handle: {
        size: "2.5rem",
        hoverSize: "2.75rem",
        background: flow.surface2,
        hoverBackground: flow.violet,
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        borderWidth: "1px",
        borderRadius: "999px",
        transitionDuration: "160ms",
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
    },

    inputchips: {
      root: {
        background: flow.surface,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        filledBackground: flow.surface2,
        filledFocusBackground: flow.surface,
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        focusBorderColor: flow.violet,
        invalidBorderColor: flow.danger,
        color: flow.text,
        disabledColor: flow.subtle,
        placeholderColor: flow.subtle,
        shadow: "none",
        paddingX: "1rem",
        paddingY: "0.625rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        transitionDuration: "160ms",
      },
      chip: {
        borderRadius: radius.sm,
        focusBackground: "rgb(124 60 255 / 0.12)",
        color: flow.text,
      },
    },

    orderlist: {
      root: {
        gap: "0.75rem",
      },
      controls: {
        gap: "0.5rem",
      },
    },

    picklist: {
      root: {
        gap: "0.75rem",
      },
      controls: {
        gap: "0.5rem",
      },
    },

    terminal: {
      root: {
        background: "#071021",
        borderColor: flow.border,
        color: flow.text,
        height: "16rem",
        padding: "1rem",
        borderRadius: radius.md,
      },
      prompt: {
        gap: "0.5rem",
      },
      commandResponse: {
        margin: "0.5rem 0 0",
      },
    },

    virtualscroller: {
      loader: {
        mask: {
          background: "rgb(11 19 40 / 0.75)",
          color: flow.text,
        },
        icon: {
          size: "1rem",
        },
      },
    },

    blockui: {
      root: {
        borderRadius: radius.md,
      },
    },

    cascadeselect: {
      root: {
        background: flow.surface,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        filledBackground: flow.surface2,
        filledHoverBackground: "#151f3f",
        filledFocusBackground: flow.surface,
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        focusBorderColor: flow.violet,
        invalidBorderColor: flow.danger,
        color: flow.text,
        disabledColor: flow.subtle,
        placeholderColor: flow.subtle,
        invalidPlaceholderColor: "#ffa3b6",
        shadow: "none",
        paddingX: "1rem",
        paddingY: "0.625rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        transitionDuration: "160ms",
      },
      dropdown: {
        width: "2.5rem",
        color: flow.muted,
      },
      overlay: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        borderRadius: radius.md,
        color: flow.text,
        shadow: glow.card,
      },
      list: {
        padding: "0.5rem",
        gap: "0.25rem",
        mobileIndent: "1rem",
      },
      option: {
        focusBackground: "rgb(124 60 255 / 0.12)",
        selectedBackground: "rgb(124 60 255 / 0.2)",
        selectedFocusBackground: "rgb(124 60 255 / 0.26)",
        color: flow.muted,
        focusColor: flow.text,
        selectedColor: flow.text,
        selectedFocusColor: flow.text,
        padding: "0.625rem 0.875rem",
        borderRadius: radius.sm,
        icon: {
          color: flow.muted,
          focusColor: flow.text,
          size: "0.875rem",
        },
      },
      clearIcon: {
        color: flow.muted,
      },
    },

    galleria: {
      root: {
        borderWidth: "1px",
        borderColor: flow.border,
        borderRadius: radius.lg,
        transitionDuration: "160ms",
      },
      navButton: {
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.12)",
        color: flow.text,
        hoverColor: flow.text,
        size: "2.5rem",
        gutter: "0.5rem",
        prev: {
          borderRadius: radius.md,
        },
        next: {
          borderRadius: radius.md,
        },
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      navIcon: {
        size: "1rem",
      },
      thumbnailsContent: {
        background: "rgb(11 19 40 / 0.9)",
        padding: "0.75rem",
      },
      thumbnailNavButton: {
        size: "2rem",
        borderRadius: radius.md,
        gutter: "0.5rem",
        hoverBackground: "rgb(124 60 255 / 0.12)",
        color: flow.text,
        hoverColor: flow.text,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      thumbnailNavButtonIcon: {
        size: "0.875rem",
      },
      caption: {
        background: "rgb(11 19 40 / 0.82)",
        color: flow.text,
        padding: "0.75rem 1rem",
      },
      indicatorList: {
        gap: "0.5rem",
        padding: "0.5rem 0",
      },
      indicatorButton: {
        width: "0.75rem",
        height: "0.75rem",
        borderRadius: "999px",
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.12)",
        activeBackground: flow.violet,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      insetIndicatorList: {
        background: "rgb(11 19 40 / 0.56)",
      },
      insetIndicatorButton: {
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.12)",
        activeBackground: flow.violet,
      },
      closeButton: {
        size: "2rem",
        gutter: "0.5rem",
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.12)",
        color: flow.text,
        hoverColor: flow.text,
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      closeButtonIcon: {
        size: "0.875rem",
      },
    },

    tabview: {
      root: {
        transitionDuration: "160ms",
      },
      tabList: {
        background: "transparent",
        borderColor: flow.border,
      },
      tab: {
        borderColor: flow.border,
        activeBorderColor: flow.violet,
        color: flow.muted,
        hoverColor: flow.text,
        activeColor: flow.text,
      },
      tabPanel: {
        background: "transparent",
        color: flow.text,
      },
      navButton: {
        background: flow.surface2,
        color: flow.text,
        hoverColor: flow.text,
        shadow: glow.card,
      },
    },

    metergroup: {
      root: {
        borderRadius: radius.md,
        gap: "0.5rem",
      },
      meters: {
        background: flow.surface2,
        size: "0.5rem",
      },
      label: {
        gap: "0.5rem",
      },
      labelMarker: {
        size: "0.75rem",
      },
      labelIcon: {
        size: "0.875rem",
      },
      labelList: {
        verticalGap: "0.5rem",
        horizontalGap: "0.75rem",
      },
    },

    organizationchart: {
      root: {
        gutter: "1rem",
        transitionDuration: "160ms",
      },
      node: {
        background: flow.surface,
        hoverBackground: "rgb(124 60 255 / 0.08)",
        selectedBackground: "rgb(124 60 255 / 0.18)",
        borderColor: flow.border,
        color: flow.text,
        selectedColor: flow.text,
        hoverColor: flow.text,
        padding: "0.75rem 1rem",
        toggleablePadding: "1rem 1.25rem",
        borderRadius: radius.md,
      },
      nodeToggleButton: {
        background: flow.surface2,
        hoverBackground: "rgb(124 60 255 / 0.12)",
        borderColor: flow.border,
        color: flow.muted,
        hoverColor: flow.text,
        size: "1.75rem",
        borderRadius: radius.sm,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
      },
      connector: {
        color: flow.border,
        borderRadius: "999px",
        height: "2px",
      },
    },

    ripple: {
      root: {
        background: "rgb(124 60 255 / 0.18)",
      },
    },

    treeselect: {
      root: {
        background: flow.surface,
        disabledBackground: "rgb(17 26 53 / 0.7)",
        filledBackground: flow.surface2,
        filledHoverBackground: "#151f3f",
        filledFocusBackground: flow.surface,
        borderColor: flow.border,
        hoverBorderColor: flow.lilac,
        focusBorderColor: flow.violet,
        invalidBorderColor: flow.danger,
        color: flow.text,
        disabledColor: flow.subtle,
        placeholderColor: flow.subtle,
        invalidPlaceholderColor: "#ffa3b6",
        shadow: "none",
        paddingX: "1rem",
        paddingY: "0.625rem",
        borderRadius: radius.md,
        focusRing: {
          width: "2px",
          style: "solid",
          color: flow.lilac,
          offset: "2px",
          shadow: "0 0 0 4px rgb(124 60 255 / 0.28)",
        },
        transitionDuration: "160ms",
      },
      dropdown: {
        width: "2.5rem",
        color: flow.muted,
      },
      overlay: {
        background: "rgb(11 19 40 / 0.96)",
        borderColor: flow.border,
        borderRadius: radius.md,
        color: flow.text,
        shadow: glow.card,
      },
      tree: {
        padding: "0.5rem",
      },
      clearIcon: {
        color: flow.muted,
      },
      emptyMessage: {
        padding: "0.75rem 0.875rem",
      },
      chip: {
        borderRadius: radius.sm,
      },
    },
  },
});

/** PrimeVue theme export consumed by app-level PrimeVue configuration. */
const applyFlowPrimeVueTheme = {
  preset: ApplyFlowPreset,
  options: {
    prefix: "p",
    darkModeSelector: ".app-dark",
    cssLayer: false,
  },
} as const;

export default applyFlowPrimeVueTheme;
