import { Github } from "@medusajs/icons";
import { Button, Heading, Text } from "@modules/common/components/ui";
const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-gradient-to-b from-lavender to-white">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span className="flex flex-col items-center gap-3">
          <Heading
            level="h1"
            className="text-4xl leading-tight tracking-wide"
          >
            YOU ARE HOME
          </Heading>
          <Text className="max-w-md text-lg font-normal text-navy-light">
            Wherever you are, you can feel at home. Handpicked pieces to
            create warmth, beauty, and belonging.
          </Text>
        </span>
        <a href="https://github.com/stuartizon/ceramics-site" target="_blank">
          <Button variant="secondary">
            View on GitHub <Github />
          </Button>
        </a>
      </div>
    </div>
  );
};

export default Hero;
