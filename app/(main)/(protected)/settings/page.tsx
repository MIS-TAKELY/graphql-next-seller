"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "@/lib/auth-client"
import { useQuery } from "@apollo/client"
import { GET_MY_SELLER_PROFILE } from "@/client/sellerProfile/sellerProfile.queries"
import { Loader2 } from "lucide-react"
import { AuthUser } from "@/types/auth"

export default function SettingsPage() {
  const { data: session, isPending: isSessionLoading } = useSession()
  const { data: profileData, loading: isProfileLoading } = useQuery(GET_MY_SELLER_PROFILE)

  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const user = session?.user as AuthUser | undefined
  const profile = profileData?.meSellerProfile

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal information and seller profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.image || "/placeholder-user.jpg"} alt="Profile" />
                  <AvatarFallback>{user?.firstName?.[0] || user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">Profile picture cannot be edited here</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={user?.firstName || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={user?.lastName || ""} readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={user?.phone || ""} readOnly />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>Your store information and appearance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input id="storeName" value={profile?.shopName || ""} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={profile?.description || ""}
                  readOnly
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeUrl">Store URL (Slug)</Label>
                  <Input id="storeUrl" value={profile?.slug || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input id="businessType" value={profile?.businessType || ""} readOnly />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Store Status</Label>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Store Active</div>
                    <div className="text-sm text-muted-foreground">
                      {profile?.isActive ? "Your store is currently visible to customers" : "Your store is currently inactive"}
                    </div>
                  </div>
                  <Switch checked={profile?.isActive || false} disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
