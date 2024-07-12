import React from "react";
import { Text } from "@saleor/macaw-ui";
import Link from "next/link";
import { useRouter } from "next/router";

interface NavigationTileProps {
  href: string;
  children: React.ReactNode;
}

export const NavigationTile = ({ href, children }: NavigationTileProps) => {
  const router = useRouter();
  const { pathname } = router;

  const isActive = pathname === href;
  return (
    <Link href={href}>
      <Text
        padding={2}
        borderRadius={4}
        backgroundColor={
          isActive
            ? "default1Pressed"
            : {
                hover: "default1Hovered",
              }
        }
        display="flex"
        gap={2}
      >
        {children}
      </Text>
    </Link>
  );
};
