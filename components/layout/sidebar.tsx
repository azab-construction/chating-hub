"use client"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useChatStore } from "@/store/chat"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/dialog"
import { PlusIcon, MessageSquareIcon, SettingsIcon, LogOutIcon, MenuIcon, Trash2Icon } from "lucide-react"
import { useTranslation } from "react-i18next"

export function Sidebar() {
  const { data: session } = useSession()
  const { chats, addChat, selectChat, removeChat, selectedChatId } = useChatStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { t } = useTranslation()

  const handleNewChat = () => {
    addChat()
    setIsSidebarOpen(false)
  }

  const handleSelectChat = (id: string) => {
    selectChat(id)
    setIsSidebarOpen(false)
  }

  const handleRemoveChat = (id: string) => {
    removeChat(id)
  }

  const sidebarContent = (
    <div className="flex h-full max-h-screen flex-col space-y-4 p-4 bg-card text-card-foreground border-r">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("sidebar.title")}</h2>
        <Button variant="ghost" size="icon" onClick={handleNewChat} aria-label={t("sidebar.newChat")}>
          <PlusIcon className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 pr-2">
        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center justify-between rounded-md p-2 cursor-pointer transition-colors ${
                selectedChatId === chat.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              onClick={() => handleSelectChat(chat.id)}
            >
              <div className="flex items-center gap-2">
                <MessageSquareIcon className="h-4 w-4" />
                <span className="truncate">{chat.title || t("sidebar.untitledChat")}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveChat(chat.id)
                }}
                aria-label={t("sidebar.deleteChat")}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t pt-4">
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user.image || "/placeholder-avatar.jpg"}
                    alt={session.user.name || "User"}
                  />
                  <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span className="truncate">{session.user.name || t("sidebar.guest")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>{t("sidebar.myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert("Go to settings")} className="cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>{t("sidebar.settings")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>{t("sidebar.signOut")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => alert("Go to sign in")}>
            <Avatar className="h-8 w-8">
              <AvatarFallback>G</AvatarFallback>
            </Avatar>
            <span>{t("sidebar.signIn")}</span>
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden md:block w-64 flex-shrink-0">{sidebarContent}</div>
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
          <Button variant="outline" size="icon" aria-label={t("sidebar.openMenu")}>
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  )
}
