import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export const Blocks = ({id, content}) => {

    const {attributes,listeners, setNodeRef, transform, transition} = useDraggable({id});

    const style = {
        transition,
        transform: CSS.Translate.toString(transform)
    }

  return (
    <div className="text mt-3">
    <div className='row'>
      <div className="col text-start">
        <span><i class="bi bi-three-dots-vertical"></i></span>
      </div>
    <div className='col text-end'>
      <button class="btn btn-sm btn-light mx-2" style={{fontWeight:'bolder'}}><i class="bi bi-pencil-fill"></i></button>
      <button class="btn btn-sm btn-light" style={{fontWeight:'bolder', color:'red'}}><i class="bi bi-trash3"></i></button>
    </div>
    </div>
    <div className='text-start mt-1 mx-2'>{content}</div>
    </div>
  )
}