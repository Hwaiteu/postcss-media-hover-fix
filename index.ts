import {
  Rule,
  AtRule,
  type PluginCreator,
  type Container,
  type Document,
  type Root as PostcssRoot,
} from "postcss";
import parser, { type Root as ParserRoot, type Node } from "postcss-selector-parser";

type SelectorProcessorResult = {
  hoverSelectors: string[];
  nonHoverSelectors: string[];
};

type TypeofAtRule = typeof AtRule;
type MediaContainer = Container | Document | PostcssRoot | undefined;

const MEDIA_PARAMS = "(hover: hover) and (pointer: fine)";

const selectorProcessor = parser((selectors: ParserRoot): SelectorProcessorResult => {
  const hoverSelectors: string[] = [];

  selectors.walk((selector: Node) => {
    if (
      selector.type === "pseudo" &&
      selector.value === ":hover" &&
      selector.parent &&
      selector.parent.value !== ":not" &&
      selector.parent.toString() !== ":hover"
    ) {
      hoverSelectors.push(selector.parent.toString());
    }
  });

  const nonHoverSelectors = selectors.nodes.reduce<string[]>((acc, selector) => {
    if (hoverSelectors.includes(selector.toString())) {
      return acc;
    }
    return [...acc, selector.toString()];
  }, []);

  return { hoverSelectors, nonHoverSelectors };
});

const createMediaQuery = (rule: Rule, AtRule: TypeofAtRule): AtRule => {
  const media = new AtRule({
    name: "media",
    params: MEDIA_PARAMS,
  });
  media.source = rule.source;
  media.append(rule.clone());
  return media;
};

const isInsideHoverMediaQuery = (rule: Rule): boolean => {
  let container: MediaContainer = rule.parent;

  while (container && container.type !== "root") {
    if (container.type === "atrule") {
      const atRule = container as AtRule;
      if (atRule.params === MEDIA_PARAMS) {
        return true;
      }
    }
    container = container.parent;
  }

  return false;
};

type PluginOptions = {};

const plugin: PluginCreator<PluginOptions> = () => {
  return {
    postcssPlugin: "postcss-hover-media-fix",
    Rule(rule: Rule, helpers: { AtRule: TypeofAtRule }) {
      if (!rule.selector.includes(":hover") || isInsideHoverMediaQuery(rule)) {
        return;
      }

      const { hoverSelectors = [], nonHoverSelectors = [] } =
        selectorProcessor.transformSync(rule.selector, {
          lossless: false,
        });

      if (hoverSelectors.length === 0) return;

      const mediaQuery = createMediaQuery(
        rule.clone({ selectors: hoverSelectors }),
        helpers.AtRule,
      );
      rule.after(mediaQuery);

      if (nonHoverSelectors.length > 0) {
        rule.replaceWith(rule.clone({ selectors: nonHoverSelectors }));
      } else {
        rule.remove();
      }
    },
    AtRule(rule: AtRule) {
      if (rule.name === "media" && rule.params === "(hover: hover)") {
        rule.params = MEDIA_PARAMS;
      }
    },
  };
};

plugin.postcss = true;

export = plugin;
