/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { MessageSquarePlus } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import { useContext, useState } from 'react'
import { Input } from '../ui/input'
import { AppContext } from '@renderer/context/app-context'
import { DeviceType } from '@renderer/types/devicetype'

const NewChat = () => {
  const { chatDevices, setChatDevices, setSelectedDevice } = useContext(AppContext)
  const [isOpen, setIsOpen] = useState(false)
  const [remoteIP, setRemoteIP] = useState('')
  const [remoteMAC, setRemoteMAC] = useState('')

  const onSubmit = () => {
    if (remoteIP && remoteMAC) {
      const deviceinfo: DeviceType = {
        name: '?',
        ip: remoteIP,
        mac: remoteMAC,
        status: '',
        hasNewMessage: false,
        content: ''
      }

      const devices = [deviceinfo, ...chatDevices]
      setChatDevices && setChatDevices(devices)
      setSelectedDevice && setSelectedDevice(deviceinfo)
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        className=" rounded-lg h-8 w-8"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquarePlus className="w-5 h-5 text-slate-600" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>Enter MAC and IP of remote machine</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <Input
              placeholder="Enter MAC of remote machine"
              onChange={(e) => setRemoteMAC(e.target.value)}
              className=" focus-visible:ring-0"
            />
            <Input
              placeholder="Enter IP of remote machine"
              onChange={(e) => setRemoteIP(e.target.value)}
              className=" focus-visible:ring-0"
            />

            <Button className=" focus-visible:ring-0" onClick={onSubmit}>
              Start Messaging
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NewChat
