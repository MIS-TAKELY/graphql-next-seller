import { Button } from "@/components/ui/button"
import { Plus, Package, ShoppingCart, TrendingUp, MessageSquare, ListTree } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    title: "Add Product",
    href: "/products/add",
    icon: Plus,
    variant: "default" as const,
  },
  {
    title: "View Orders",
    href: "/orders",
    icon: ShoppingCart,
    variant: "outline" as const,
  },
  {
    title: "Inventory",
    href: "/products/inventory",
    icon: Package,
    variant: "outline" as const,
  },
  {
    title: "Categories",
    href: "/products/categories",
    icon: ListTree,
    variant: "outline" as const,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    variant: "outline" as const,
  },
  {
    title: "Messages",
    href: "/customers/messages",
    icon: MessageSquare,
    variant: "outline" as const,
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
      {actions.map((action) => (
        <Button
          key={action.title}
          asChild
          variant={action.variant}
          className="w-full justify-start h-12 sm:h-auto px-4"
        >
          <Link href={action.href}>
            <action.icon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{action.title}</span>
          </Link>
        </Button>
      ))}
    </div>
  )
}
