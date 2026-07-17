import Image from "next/image";
import Link from "next/link";
import { Button, Heading, Text } from "@modules/common/components/ui";
const Hero = () => {
  return (
    <div className="h-[75vh] w-full relative overflow-hidden">
      <Image
        src="/images/hero/hero-background.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center scale-105 blur-[1px] saturate-[0.85]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-lavender/70 via-white/45 to-white" />
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span className="flex flex-col items-center gap-3">
          <Heading
            level="h1"
            className="text-5xl small:text-6xl leading-tight tracking-wide font-bold"
          >
            YOU ARE HOME
          </Heading>
          <Text className="max-w-md text-lg font-semibold text-navy">
            Wherever you are, you can feel at home. Handpicked pieces to
            create warmth, beauty, and belonging.
          </Text>
        </span>
        <Link href="/store">
          <Button variant="secondary">Explore the Collection</Button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
