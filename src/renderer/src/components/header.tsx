/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ReactNode } from 'react'
import lanTalkLogo from '../assets/lantalklinear.svg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { Settings } from 'lucide-react'

const Header: () => ReactNode = () => {
  const onFactoryReset = () => {
    window.LanTalk.factoryReset()
  }

  return (
    <div className="h-44 bg-primary">
      <div className="h-[3.5rem] flex items-center">
        <div className="h-8 flex items-center px-4  ml-20 bg-white rounded-2xl">
          <div className="w-32 cursor-pointer">
            <img alt="logo" className="logo w-full" src={lanTalkLogo} />
          </div>
        </div>
        <div className="flex-1 h-full" id="dragWindow"></div>
        <div className="flex pr-5 focus-visible:[&>*]:outline-none">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className=" rounded-lg w-7 h-7 flex items-center justify-center focus-visible:outline-none ">
                <Settings className="text-white w-5 h-5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator /> */}
              <DropdownMenuItem onClick={() => window.LanTalk.openDbFolder()}>
                Open DB
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onFactoryReset}>Factory Reset</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default Header
