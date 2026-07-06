"use client"
import { useParams } from 'next/navigation';
import React from 'react'
import { usePlayground } from '../../../../modules/playground/hooks/usePlaygound';

const MainPlaygroundPage = () => {
    const {id}= useParams<{id:string}>();

    const {playgroundData, templateData, isLoading, error, loadPlayground, saveTemplateData}=usePlayground(id)
    console.log("playgroundData:", playgroundData)
    console.log("templateData:", templateData)
  return (
    <div>
      Params:{id}
    </div>
  )
}

export default MainPlaygroundPage
