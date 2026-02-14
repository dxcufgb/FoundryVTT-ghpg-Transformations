export async function getRandomFileInFolder ( folderPath, source = "data" )
{
  const result = await foundry.applications.apps.FilePicker.implementation.browse( source, folderPath )

  const files = result.files
  if ( !files.length ) return null

  return files[ Math.floor( Math.random() * files.length ) ]
}